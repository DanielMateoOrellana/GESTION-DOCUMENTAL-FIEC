import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
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
    return this.prisma.processTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        isLocked: dto.isLocked ?? false,
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
        processType: { include: { category: true } },
        createdBy: { select: { id: true, fullName: true } },
        steps: { orderBy: { order: 'asc' } },
      },
    });
  }

  findAll() {
    return this.prisma.processTemplate.findMany({
      include: {
        processType: { include: { category: true } },
        steps: { orderBy: { order: 'asc' } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const template = await this.prisma.processTemplate.findUnique({
      where: { id },
      include: {
        processType: { include: { category: true } },
        steps: { orderBy: { order: 'asc' } },
      },
    });

    if (!template) {
      throw new NotFoundException(`ProcessTemplate #${id} not found`);
    }
    return template;
  }

  async update(id: number, dto: UpdateProcessTemplateDto, userId?: number, userRole?: string) {
    // Check if template is locked and user is not ADMIN
    const template = await this.findOne(id);
    if (template.isLocked && userRole !== 'ADMINISTRADOR') {
      throw new ForbiddenException('Esta plantilla está bloqueada y solo puede ser editada por administradores.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.processTemplate.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          isActive: dto.isActive,
          isLocked: dto.isLocked,
          processTypeId: dto.processTypeId,
        },
      });

      if (dto.steps && dto.steps.length > 0) {
        const existingSteps = await tx.processTemplateStep.findMany({
          where: { templateId: id },
          orderBy: { order: 'asc' },
        });

        for (let i = 0; i < dto.steps.length; i++) {
          const stepDto = dto.steps[i];

          if (i < existingSteps.length) {
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
            await tx.processTemplateStep.create({
              data: {
                templateId: id,
                name: stepDto.name,
                description: stepDto.description,
                order: stepDto.order,
                isMandatory: stepDto.isMandatory ?? true,
              },
            });
          }
        }
      }

      return tx.processTemplate.findUnique({
        where: { id },
        include: {
          processType: { include: { category: true } },
          steps: { orderBy: { order: 'asc' } },
        },
      });
    });
  }

  async remove(id: number, userId?: number, userRole?: string) {
    const template = await this.findOne(id);

    // Check if template is locked and user is not ADMIN
    if (template.isLocked && userRole !== 'ADMINISTRADOR') {
      throw new ForbiddenException('Esta plantilla está bloqueada y solo puede ser eliminada por administradores.');
    }

    const instancesCount = await this.prisma.processInstance.count({
      where: { templateId: id },
    });

    if (instancesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar "${template.name}" porque tiene ${instancesCount} proceso(s) asociado(s).`,
      );
    }

    await this.prisma.processTemplateStep.deleteMany({
      where: { templateId: id },
    });

    await this.prisma.processTemplate.delete({ where: { id } });

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
