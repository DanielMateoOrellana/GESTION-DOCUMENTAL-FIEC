import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { UpdateProcessTypeDto } from './dto/update-process-type.dto';

@Injectable()
export class ProcessTypesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProcessTypeDto) {
    return this.prisma.processType.create({
      data,
      include: { category: true },
    });
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

  async update(id: number, data: UpdateProcessTypeDto) {
    await this.findOne(id);
    return this.prisma.processType.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.processType.delete({
      where: { id },
    });
  }
}
