import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Express } from 'express';

@Injectable()
export class StepFilesService {
  constructor(private prisma: PrismaService) { }

  async upload(stepId: number, file: Express.Multer.File, userId?: number) {
    // ... (existing upload logic) ...
    // última versión + 1
    const last = await this.prisma.stepFile.findFirst({
      where: { stepId },
      orderBy: { version: 'desc' },
    });

    const version = (last?.version ?? 0) + 1;

    const created = await this.prisma.stepFile.create({
      data: {
        stepId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        version,
        content: new Uint8Array(file.buffer),
        uploadedById: userId,
      },
    });

    // no devolvemos el blob
    const { content, ...rest } = created;

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

    if (allStepsCompleted) {
      // 3. Si todo está completo, marcar el proceso como COMPLETADO
      await this.prisma.processInstance.update({
        where: { id: step.processInstance.id },
        data: {
          estado: 'COMPLETADO',
          completedAt: new Date(),
        },
      });
    }
    // ---------------------------------

    return rest;
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

  async getFile(stepId: number, fileId: number) {
    const file = await this.prisma.stepFile.findFirst({
      where: { id: fileId, stepId },
    });

    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return file;
  }

  async deleteFile(stepId: number, fileId: number) {
    const file = await this.prisma.stepFile.findFirst({
      where: { id: fileId, stepId },
    });

    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    await this.prisma.stepFile.delete({
      where: { id: fileId },
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

      // Revertir proceso a PENDIENTE si estaba completado?
      // Buscamos el proceso
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
