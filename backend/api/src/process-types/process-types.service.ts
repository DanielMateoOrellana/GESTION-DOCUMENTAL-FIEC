import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { UpdateProcessTypeDto } from './dto/update-process-type.dto';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';

@Injectable()
export class ProcessTypesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) { }

  async create(data: CreateProcessTypeDto, userId?: number) {
    const processType = await this.prisma.processType.create({
      data: {
        ...data,
        createdById: userId,
      },
      include: {
        category: true,
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    // Nota: Auditoría de ProcessType removida - no está en whitelist

    return processType;
  }

  findAll() {
    return this.prisma.processType.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const pt = await this.prisma.processType.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!pt) throw new NotFoundException('ProcessType not found');
    return pt;
  }

  async update(id: number, data: UpdateProcessTypeDto, userId?: number) {
    const existing = await this.findOne(id);

    const processType = await this.prisma.processType.update({
      where: { id },
      data,
      include: { category: true },
    });

    // Nota: Auditoría de ProcessType removida - no está en whitelist

    return processType;
  }

  async remove(id: number, userId?: number) {
    const processType = await this.findOne(id);

    // Verificar si tiene plantillas asociadas
    const templatesCount = await this.prisma.processTemplate.count({
      where: { processTypeId: id },
    });

    if (templatesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo de proceso "${processType.name}" porque tiene ${templatesCount} plantilla(s) asociada(s). Elimine primero las plantillas.`
      );
    }

    await this.prisma.processType.delete({
      where: { id },
    });

    // Nota: Auditoría de ProcessType removida - no está en whitelist

    return processType;
  }
}

