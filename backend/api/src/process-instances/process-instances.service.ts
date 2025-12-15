import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';
import { EstadoProceso, EstadoPaso } from '@prisma/client';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';

@Injectable()
export class ProcessInstancesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) { }

  async create(dto: CreateProcessInstanceDto, userId: number) {
    // 1) Buscar la plantilla con sus pasos
    const template = await this.prisma.processTemplate.findUnique({
      where: { id: dto.templateId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    if (!template) {
      throw new NotFoundException(`La plantilla #${dto.templateId} no existe`);
    }

    // 2) Validar que la plantilla pertenezca al tipo de proceso enviado
    if (template.processTypeId !== dto.processTypeId) {
      throw new NotFoundException(
        `La plantilla #${dto.templateId} no pertenece al tipo de proceso #${dto.processTypeId}`,
      );
    }

    // 3) Crear la instancia de proceso + sus pasos
    const instance = await this.prisma.processInstance.create({
      data: {
        title: dto.title,
        estado: EstadoProceso.PENDIENTE,
        processTypeId: dto.processTypeId,
        templateId: dto.templateId,
        comment: dto.comment ?? null,
        createdById: userId, // Quién creó el proceso
        responsibleUserId: userId, // Responsable inicial = creador
        year: dto.year ?? null,
        month: dto.month ?? null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        steps: {
          create: template.steps.map((s) => ({
            title: s.name,
            estado: EstadoPaso.PENDIENTE,
            templateStepId: s.id,
            dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
          })),
        },
      },
      include: {
        processType: true,
        template: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
        steps: {
          orderBy: { id: 'asc' },
        },
      },
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.CREATE,
      entityType: EntityTypes.PROCESS_INSTANCE,
      entityId: instance.id,
      description: `Proceso "${instance.title || `Proceso #${instance.id}`}" creado`,
      details: {
        processTypeId: dto.processTypeId,
        templateId: dto.templateId,
        year: dto.year,
        stepsCount: template.steps.length,
      },
      userId,
    });

    return instance;
  }

  findAll() {
    return this.prisma.processInstance.findMany({
      include: {
        processType: true,
        template: true,
        steps: {
          orderBy: { id: 'asc' }
        },
        responsibleUser: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const instance = await this.prisma.processInstance.findUnique({
      where: { id },
      include: {
        responsibleUser: true,
        processType: true,
        template: {
          include: { processType: true },
        },
        steps: {
          include: {
            templateStep: true,
          },
          orderBy: { id: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!instance) {
      throw new NotFoundException(
        `Instancia de proceso #${id} no encontrada`,
      );
    }

    return instance;
  }
}
