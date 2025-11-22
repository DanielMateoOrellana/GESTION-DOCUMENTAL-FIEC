import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessCategoryDto } from './dto/create-process-category.dto';
import { UpdateProcessCategoryDto } from './dto/update-process-category.dto';

@Injectable()
export class ProcessCategoriesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProcessCategoryDto) {
    return this.prisma.processCategory.create({ data });
  }

  findAll() {
    return this.prisma.processCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const cat = await this.prisma.processCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('ProcessCategory not found');
    return cat;
  }

  async update(id: number, data: UpdateProcessCategoryDto) {
    await this.findOne(id);
    return this.prisma.processCategory.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.processCategory.delete({ where: { id } });
  }
}
