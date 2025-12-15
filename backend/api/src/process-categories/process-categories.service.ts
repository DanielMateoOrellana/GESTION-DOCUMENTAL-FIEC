import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessCategoryDto } from './dto/create-process-category.dto';
import { UpdateProcessCategoryDto } from './dto/update-process-category.dto';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';

@Injectable()
export class ProcessCategoriesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) { }

  async create(data: CreateProcessCategoryDto, userId?: number) {
    const category = await this.prisma.processCategory.create({
      data: {
        ...data,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.CREATE,
      entityType: EntityTypes.PROCESS_CATEGORY,
      entityId: category.id,
      description: `Categoría "${category.name}" creada`,
      details: { name: category.name },
      userId,
    });

    return category;
  }

  findAll() {
    return this.prisma.processCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const cat = await this.prisma.processCategory.findUnique({
      where: { id },
    });
    if (!cat) throw new NotFoundException('ProcessCategory not found');
    return cat;
  }

  async update(id: number, data: UpdateProcessCategoryDto, userId?: number) {
    const existing = await this.findOne(id);

    const category = await this.prisma.processCategory.update({
      where: { id },
      data,
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.UPDATE,
      entityType: EntityTypes.PROCESS_CATEGORY,
      entityId: category.id,
      description: `Categoría "${category.name}" actualizada`,
      details: { previousName: existing.name, newName: data.name },
      userId,
    });

    return category;
  }

  async remove(id: number, userId?: number) {
    const category = await this.findOne(id);

    await this.prisma.processCategory.delete({ where: { id } });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.DELETE,
      entityType: EntityTypes.PROCESS_CATEGORY,
      entityId: id,
      description: `Categoría "${category.name}" eliminada`,
      userId,
    });

    return category;
  }
}
