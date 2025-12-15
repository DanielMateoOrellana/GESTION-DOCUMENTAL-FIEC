import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessTemplateDto } from './dto/create-process-template.dto';
import { UpdateProcessTemplateDto } from './dto/update-process-template.dto';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';

@Injectable()
export class ProcessTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) { }

  async create(dto: CreateProcessTemplateDto, userId?: number) {
    const template = await this.prisma.processTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        processTypeId: dto.processTypeId,
        createdById: userId,
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
        createdBy: {
          select: { id: true, fullName: true },
        },
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.CREATE,
      entityType: EntityTypes.PROCESS_TEMPLATE,
      entityId: template.id,
      description: `Plantilla "${template.name}" creada`,
      details: {
        name: template.name,
        processTypeId: dto.processTypeId,
        stepsCount: dto.steps?.length || 0,
      },
      userId,
    });

    return template;
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

  async update(id: number, dto: UpdateProcessTemplateDto, userId?: number) {
    // Transaction to update steps safely
    const result = await this.prisma.$transaction(async (tx) => {
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
            // Create new step if user added one
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

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.UPDATE,
      entityType: EntityTypes.PROCESS_TEMPLATE,
      entityId: id,
      description: `Plantilla "${result?.name}" actualizada`,
      details: {
        name: dto.name,
        stepsUpdated: dto.steps?.length || 0,
      },
      userId,
    });

    return result;
  }

  async remove(id: number, userId?: number) {
    const template = await this.findOne(id);

    await this.prisma.processTemplate.delete({
      where: { id },
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.DELETE,
      entityType: EntityTypes.PROCESS_TEMPLATE,
      entityId: id,
      description: `Plantilla "${template.name}" eliminada`,
      userId,
    });

    return template;
  }
}
