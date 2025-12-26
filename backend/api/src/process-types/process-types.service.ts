import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { UpdateProcessTypeDto } from './dto/update-process-type.dto';

@Injectable()
export class ProcessTypesService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateProcessTypeDto, userId?: number) {
    return this.prisma.processType.create({
      data: { ...data, createdById: userId },
      include: {
        category: true,
        createdBy: { select: { id: true, fullName: true } },
      },
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

  async update(id: number, data: UpdateProcessTypeDto, userId?: number) {
    await this.findOne(id);
    return this.prisma.processType.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(id: number, userId?: number) {
    const processType = await this.findOne(id);

    const templatesCount = await this.prisma.processTemplate.count({
      where: { processTypeId: id },
    });

    if (templatesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar "${processType.name}" porque tiene ${templatesCount} plantilla(s) asociada(s).`,
      );
    }

    await this.prisma.processType.delete({ where: { id } });
    return processType;
  }
}
