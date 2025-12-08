import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessTemplateDto } from './dto/create-process-template.dto';
import { UpdateProcessTemplateDto } from './dto/update-process-template.dto';

@Injectable()
export class ProcessTemplatesService {
  constructor(private readonly prisma: PrismaService) { }

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
    // Transaction to update steps safely
    return this.prisma.$transaction(async (tx) => {
      // 1. Update template details
      await tx.processTemplate.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          isActive: dto.isActive,
          processTypeId: dto.processTypeId,
        },
      });

      // 2. Handle steps if provided
      if (dto.steps && dto.steps.length > 0) {
        // Fetch existing steps to match or update
        // We assume steps in DTO correspond to existing steps in order.
        // This is a simplification based on the prompt "only edit names and description".
        // The safest way without IDs in DTO is to iterate by index.

        const existingSteps = await tx.processTemplateStep.findMany({
          where: { templateId: id },
          orderBy: { order: 'asc' },
        });

        for (let i = 0; i < dto.steps.length; i++) {
          const stepDto = dto.steps[i];

          if (i < existingSteps.length) {
            // Update existing step
            await tx.processTemplateStep.update({
              where: { id: existingSteps[i].id },
              data: {
                name: stepDto.name,
                description: stepDto.description,
                isMandatory: stepDto.isMandatory ?? true,
                order: stepDto.order,
              },
            });
          } else {
            // Create new step if user added one (though we try to prevent this in UI)
            await tx.processTemplateStep.create({
              data: {
                templateId: id,
                name: stepDto.name,
                description: stepDto.description,
                order: stepDto.order,
                isMandatory: stepDto.isMandatory ?? true,
              }
            });
          }
        }
      }

      // Re-fetch to return full object
      return tx.processTemplate.findUnique({
        where: { id },
        include: {
          processType: { include: { category: true } },
          steps: { orderBy: { order: 'asc' } },
        }
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.processTemplate.delete({
      where: { id },
    });
  }
}
