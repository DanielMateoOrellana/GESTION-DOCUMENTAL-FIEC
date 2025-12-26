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
    const last = await this.prisma.stepFile.findFirst({
      where: { stepId },
      orderBy: { version: 'desc' },
    });

    const version = (last?.version ?? 0) + 1;
    const storageKey = this.r2.generateKey(file.originalname, `steps/${stepId}/`);

    await this.r2.upload(storageKey, file.buffer, file.mimetype);

    const created = await this.prisma.stepFile.create({
      data: {
        stepId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        version,
        storageKey,
        uploadedById: userId,
      },
    });

    // Auto-complete: marcar paso como completado al subir archivo
    const step = await this.prisma.stepInstance.update({
      where: { id: stepId },
      data: {
        estado: 'COMPLETADO',
        completedAt: new Date(),
      },
      include: {
        processInstance: {
          include: { steps: true },
        },
      },
    });

    const allStepsCompleted = step.processInstance.steps.every(
      (s) => s.estado === 'COMPLETADO',
    );

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

    if (allStepsCompleted) {
      await this.prisma.processInstance.update({
        where: { id: step.processInstance.id },
        data: {
          estado: 'COMPLETADO',
          completedAt: new Date(),
        },
      });
    }

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

  async getFileStream(
    stepId: number,
    fileId: number,
    userId?: number,
  ): Promise<{
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

    const stream = await this.r2.getStream(file.storageKey);

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

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    return this.r2.getBuffer(storageKey);
  }

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

    try {
      await this.r2.delete(file.storageKey);
    } catch (error) {
      console.error(`Error deleting file from R2: ${file.storageKey}`, error);
    }

    await this.prisma.stepFile.delete({
      where: { id: fileId },
    });

    await this.auditLog.log({
      action: AuditActions.DELETE,
      entityType: EntityTypes.FILE,
      entityId: fileId,
      description: `Archivo "${file.originalName}" eliminado del paso #${stepId}`,
      details: { stepId, fileName: file.originalName, storageKey: file.storageKey },
      userId,
    });

    const remainingFiles = await this.prisma.stepFile.count({
      where: { stepId },
    });

    // Revertir estado si no quedan archivos
    if (remainingFiles === 0) {
      await this.prisma.stepInstance.update({
        where: { id: stepId },
        data: {
          estado: 'PENDIENTE',
          completedAt: null,
        },
      });

      const step = await this.prisma.stepInstance.findUnique({
        where: { id: stepId },
        include: { processInstance: true },
      });

      if (step && step.processInstance.estado === 'COMPLETADO') {
        await this.prisma.processInstance.update({
          where: { id: step.processInstanceId },
          data: {
            estado: 'PENDIENTE',
            completedAt: null,
          },
        });
      }
    }
  }

  async getPresignedUrl(
    stepId: number,
    fileId: number,
  ): Promise<{ url: string; fileName: string }> {
    const file = await this.prisma.stepFile.findFirst({
      where: { id: fileId, stepId },
    });

    if (!file) {
      throw new NotFoundException(`Archivo #${fileId} no encontrado en el paso #${stepId}`);
    }

    const url = await this.r2.getPresignedUrl(file.storageKey);
    return { url, fileName: file.originalName };
  }
}
