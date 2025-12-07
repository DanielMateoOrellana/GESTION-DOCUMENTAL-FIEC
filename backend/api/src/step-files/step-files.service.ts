import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Express } from 'express';

@Injectable()
export class StepFilesService {
  constructor(private prisma: PrismaService) { }

  async upload(stepId: number, file: Express.Multer.File, userId?: number) {
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
}
