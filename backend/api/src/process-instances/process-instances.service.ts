import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';
import { EstadoProceso, EstadoPaso } from '@prisma/client';

@Injectable()
export class ProcessInstancesService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.processInstance.create({
      data: {
        title: dto.title,
        estado: EstadoProceso.PENDIENTE,
        processTypeId: dto.processTypeId,
        templateId: dto.templateId,
        comment: dto.comment ?? null,
        responsibleUserId: userId,      // <- aquí usamos el usuario logueado
        year: dto.year ?? null,
        month: dto.month ?? null,
        steps: {
          create: template.steps.map((s) => ({
            title: s.name,
            estado: EstadoPaso.PENDIENTE,
            templateStepId: s.id,
            // dueAt lo puedes calcular luego si quieres
          })),
        },
      },
      include: {
        processType: true,
        template: true,
        steps: {
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  findAll() {
    return this.prisma.processInstance.findMany({
      include: {
        processType: true,
        template: true,
        steps: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const instance = await this.prisma.processInstance.findUnique({
      where: { id },
      include: {
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
