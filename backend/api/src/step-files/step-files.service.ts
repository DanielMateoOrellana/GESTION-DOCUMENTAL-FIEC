import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';
import type { Express } from 'express';
import type { Readable } from 'stream';

@Injectable()
export class StepFilesService {
  constructor(
    private prisma: PrismaService,
    private r2: R2Service,
    private auditLog: AuditLogService,
  ) { }

  async upload(stepId: number, file: Express.Multer.File, userId?: number) {
    // Última versión + 1
    const last = await this.prisma.stepFile.findFirst({
      where: { stepId },
      orderBy: { version: 'desc' },
    });

    const version = (last?.version ?? 0) + 1;

    // Generar key única para R2
    const storageKey = this.r2.generateKey(file.originalname, `steps/${stepId}/`);

    // Subir archivo a R2
    await this.r2.upload(storageKey, file.buffer, file.mimetype);

    // Guardar registro en BD (sin el contenido del archivo)
    const created = await this.prisma.stepFile.create({
      data: {
        stepId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        version,
        storageKey, // Key en R2
        // content ya no se guarda (solo metadatos)
        uploadedById: userId,
      },
    });

    // --- LOGICA DE AUTO-COMPLETADO ---
    // 1. Marcar el paso actual como COMPLETADO
    const step = await this.prisma.stepInstance.update({
      where: { id: stepId },
      data: {
        estado: 'COMPLETADO',
        completedAt: new Date(),
      },
      include: {
        processInstance: {
          include: {
            steps: true, // necesitamos los hermanos para verificar si están todos completos
          },
        },
      },
    });

    // 2. Verificar si todos los pasos del proceso están COMPLETADOS
    const allStepsCompleted = step.processInstance.steps.every(
      (s) => s.estado === 'COMPLETADO',
    );

    // Registrar en bitácora - subida de archivo
    await this.auditLog.log({
      action: AuditActions.UPLOAD,
      entityType: EntityTypes.FILE,
      entityId: created.id,
      description: `Archivo "${file.originalname}" subido al paso #${stepId}`,
      details: {
        stepId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        version,
        storageKey,
        processInstanceId: step.processInstanceId,
      },
      userId,
    });

    // Si el paso se completó, registrar también
    await this.auditLog.log({
      action: AuditActions.COMPLETE,
      entityType: EntityTypes.STEP_INSTANCE,
      entityId: stepId,
      description: `Paso "${step.title}" completado`,
      details: {
        processInstanceId: step.processInstanceId,
        fileId: created.id,
      },
      userId,
    });

    if (allStepsCompleted) {
      // 3. Si todo está completo, marcar el proceso como COMPLETADO
      await this.prisma.processInstance.update({
        where: { id: step.processInstance.id },
        data: {
          estado: 'COMPLETADO',
          completedAt: new Date(),
        },
      });

      // Registrar en bitácora - proceso completado
      await this.auditLog.log({
        action: AuditActions.COMPLETE,
        entityType: EntityTypes.PROCESS_INSTANCE,
        entityId: step.processInstance.id,
        description: `Proceso "${step.processInstance.title || `#${step.processInstance.id}`}" completado`,
        details: {
          totalSteps: step.processInstance.steps.length,
        },
        userId,
      });
    }
    // ---------------------------------

    return created;
  }

  async listByStep(stepId: number) {
    return this.prisma.stepFile.findMany({
      where: { stepId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        stepId: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        version: true,
        storageKey: true,
        uploadedAt: true,
        uploadedById: true,
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene el stream de un archivo desde R2
   */
  async getFileStream(stepId: number, fileId: number, userId?: number): Promise<{
    stream: Readable;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }> {
    const file = await this.prisma.stepFile.findFirst({
      where: { id: fileId, stepId },
    });

    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Obtener stream desde R2
    const stream = await this.r2.getStream(file.storageKey);

    // Registrar descarga en bitácora
    await this.auditLog.log({
      action: AuditActions.DOWNLOAD,
      entityType: EntityTypes.FILE,
      entityId: fileId,
      description: `Archivo "${file.originalName}" descargado`,
      details: { stepId, fileName: file.originalName, storageKey: file.storageKey },
      userId,
    });

    return {
      stream,
      fileName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
    };
  }

  /**
   * Obtiene el buffer de un archivo desde R2 (para exportación ZIP)
   */
  async getFileBuffer(storageKey: string): Promise<Buffer> {
    return this.r2.getBuffer(storageKey);
  }

  /**
   * Obtiene metadatos de un archivo (sin contenido)
   */
  async getFile(stepId: number, fileId: number) {
    const file = await this.prisma.stepFile.findFirst({
      where: { id: fileId, stepId },
    });

    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return file;
  }

  async deleteFile(stepId: number, fileId: number, userId?: number) {
    const file = await this.prisma.stepFile.findFirst({
      where: { id: fileId, stepId },
    });

    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Primero eliminar de R2
    try {
      await this.r2.delete(file.storageKey);
    } catch (error) {
      console.error(`Error deleting file from R2: ${file.storageKey}`, error);
      // Continuar con la eliminación del registro aunque falle R2
    }

    // Luego eliminar registro de BD
    await this.prisma.stepFile.delete({
      where: { id: fileId },
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.DELETE,
      entityType: EntityTypes.FILE,
      entityId: fileId,
      description: `Archivo "${file.originalName}" eliminado del paso #${stepId}`,
      details: { stepId, fileName: file.originalName, storageKey: file.storageKey },
      userId,
    });

    // Verificar si quedan archivos en el paso
    const remainingFiles = await this.prisma.stepFile.count({
      where: { stepId },
    });

    if (remainingFiles === 0) {
      // Revertir paso a PENDIENTE
      await this.prisma.stepInstance.update({
        where: { id: stepId },
        data: {
          estado: 'PENDIENTE',
          completedAt: null,
        },
      });

      // Revertir proceso a PENDIENTE si estaba completado
      const step = await this.prisma.stepInstance.findUnique({
        where: { id: stepId },
        include: { processInstance: true }
      });

      if (step && step.processInstance.estado === 'COMPLETADO') {
        await this.prisma.processInstance.update({
          where: { id: step.processInstanceId },
          data: {
            estado: 'PENDIENTE',
            completedAt: null
          }
        });
      }
    }
  }
}
