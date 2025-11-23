import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessTemplateDto } from './dto/create-process-template.dto';
import { UpdateProcessTemplateDto } from './dto/update-process-template.dto';

@Injectable()
export class ProcessTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProcessTemplateDto) {
    return this.prisma.processTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        processType: {
          connect: { id: dto.processTypeId },
        },
        steps:
          dto.steps && dto.steps.length > 0
            ? {
                create: dto.steps.map((s) => ({
                  order: s.order,
                  name: s.name,
                  description: s.description,
                  responsibleRole: s.responsibleRole,
                  dueDaysFromStart: s.dueDaysFromStart,
                  isMandatory: s.isMandatory ?? true,
                })),
              }
            : undefined,
      },
      include: {
        processType: {
          include: {
            category: true,
          },
        },
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  findAll() {
    return this.prisma.processTemplate.findMany({
      include: {
        processType: {
          include: {
            category: true,
          },
        },
        steps: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const template = await this.prisma.processTemplate.findUnique({
      where: { id },
      include: {
        processType: {
          include: {
            category: true,
          },
        },
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`ProcessTemplate #${id} not found`);
    }

    return template;
  }

  async update(id: number, dto: UpdateProcessTemplateDto) {
    // por ahora, actualizar solo datos de la plantilla
    await this.findOne(id);

    return this.prisma.processTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
        processTypeId: dto.processTypeId,
      },
      include: {
        processType: {
          include: {
            category: true,
          },
        },
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.processTemplate.delete({
      where: { id },
    });
  }
}
