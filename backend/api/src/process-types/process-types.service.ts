import { Injectable, NotFoundException } from '@nestjs/common';
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

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.CREATE,
      entityType: EntityTypes.PROCESS_TYPE,
      entityId: processType.id,
      description: `Tipo de proceso "${processType.name}" creado`,
      details: { name: processType.name, categoryId: data.categoryId },
      userId,
    });

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

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.UPDATE,
      entityType: EntityTypes.PROCESS_TYPE,
      entityId: processType.id,
      description: `Tipo de proceso "${processType.name}" actualizado`,
      details: { previousName: existing.name, newName: data.name },
      userId,
    });

    return processType;
  }

  async remove(id: number, userId?: number) {
    const processType = await this.findOne(id);

    await this.prisma.processType.delete({
      where: { id },
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.DELETE,
      entityType: EntityTypes.PROCESS_TYPE,
      entityId: id,
      description: `Tipo de proceso "${processType.name}" eliminado`,
      userId,
    });

    return processType;
  }
}
