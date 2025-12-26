import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessCategoryDto } from './dto/create-process-category.dto';
import { UpdateProcessCategoryDto } from './dto/update-process-category.dto';

@Injectable()
export class ProcessCategoriesService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateProcessCategoryDto, userId?: number) {
    return this.prisma.processCategory.create({
      data: { ...data, createdById: userId },
      include: { createdBy: { select: { id: true, fullName: true } } },
    });
  }

  findAll() {
    return this.prisma.processCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { processTypes: true } } },
    });
  }

  async findOne(id: number) {
    const cat = await this.prisma.processCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('ProcessCategory not found');
    return cat;
  }

  async update(id: number, data: UpdateProcessCategoryDto, userId?: number) {
    await this.findOne(id);
    return this.prisma.processCategory.update({ where: { id }, data });
  }

  async remove(id: number, userId?: number) {
    const category = await this.findOne(id);

    const typesCount = await this.prisma.processType.count({
      where: { categoryId: id },
    });

    if (typesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar "${category.name}" porque tiene ${typesCount} tipo(s) de proceso asociado(s).`,
      );
    }

    await this.prisma.processCategory.delete({ where: { id } });
    return category;
  }
}
