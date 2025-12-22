import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

    // Nota: Auditoría de ProcessCategory removida - no está en whitelist

    return category;
  }

  findAll() {
    return this.prisma.processCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { processTypes: true }
        }
      }
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

    // Nota: Auditoría de ProcessCategory removida - no está en whitelist

    return category;
  }

  async remove(id: number, userId?: number) {
    const category = await this.findOne(id);

    // Verificar si tiene ProcessTypes asociados
    const typesCount = await this.prisma.processType.count({
      where: { categoryId: id },
    });

    if (typesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría "${category.name}" porque tiene ${typesCount} tipo(s) de proceso asociado(s). Elimine o reasigne los tipos primero.`
      );
    }

    await this.prisma.processCategory.delete({ where: { id } });

    // Nota: Auditoría de ProcessCategory removida - no está en whitelist

    return category;
  }
}

