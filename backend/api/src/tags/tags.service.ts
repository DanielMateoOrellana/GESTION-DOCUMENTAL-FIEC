import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';

@Injectable()
export class TagsService {
    constructor(
        private prisma: PrismaService,
        private auditLog: AuditLogService,
    ) { }

    async findAll() {
        return this.prisma.tag.findMany({
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        processInstances: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: number) {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                processInstances: {
                    include: {
                        processInstance: {
                            select: {
                                id: true,
                                title: true,
                                estado: true,
                            },
                        },
                    },
                },
            },
        });

        if (!tag) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }

        return tag;
    }

    async create(dto: CreateTagDto, userId?: number) {
        // Verificar si ya existe una etiqueta con el mismo nombre
        const existing = await this.prisma.tag.findUnique({
            where: { name: dto.name },
        });

        if (existing) {
            throw new ConflictException(`Ya existe una etiqueta con el nombre "${dto.name}"`);
        }

        const tag = await this.prisma.tag.create({
            data: {
                name: dto.name,
                color: dto.color,
                createdById: userId,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        // Registrar en bitácora
        await this.auditLog.log({
            action: AuditActions.CREATE,
            entityType: EntityTypes.TAG,
            entityId: tag.id,
            description: `Etiqueta "${tag.name}" creada`,
            details: { name: tag.name, color: tag.color },
            userId,
        });

        return tag;
    }

    async update(id: number, dto: UpdateTagDto, userId?: number) {
        // Verificar que existe
        const existing = await this.findOne(id);

        // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
        if (dto.name) {
            const duplicate = await this.prisma.tag.findFirst({
                where: {
                    name: dto.name,
                    NOT: { id },
                },
            });

            if (duplicate) {
                throw new ConflictException(`Ya existe otra etiqueta con el nombre "${dto.name}"`);
            }
        }

        const tag = await this.prisma.tag.update({
            where: { id },
            data: dto,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        // Registrar en bitácora
        await this.auditLog.log({
            action: AuditActions.UPDATE,
            entityType: EntityTypes.TAG,
            entityId: tag.id,
            description: `Etiqueta "${tag.name}" actualizada`,
            details: { previousName: existing.name, newName: dto.name, newColor: dto.color },
            userId,
        });

        return tag;
    }

    async remove(id: number, userId?: number) {
        const tag = await this.findOne(id);

        await this.prisma.tag.delete({ where: { id } });

        // Registrar en bitácora
        await this.auditLog.log({
            action: AuditActions.DELETE,
            entityType: EntityTypes.TAG,
            entityId: id,
            description: `Etiqueta "${tag.name}" eliminada`,
            userId,
        });

        return tag;
    }

    // Asignar una etiqueta a un proceso
    async assignToProcess(processInstanceId: number, tagId: number, userId?: number) {
        // Verificar que el proceso existe
        const process = await this.prisma.processInstance.findUnique({
            where: { id: processInstanceId },
        });

        if (!process) {
            throw new NotFoundException(`Process with ID ${processInstanceId} not found`);
        }

        // Verificar que la etiqueta existe
        const tag = await this.prisma.tag.findUnique({
            where: { id: tagId },
        });

        if (!tag) {
            throw new NotFoundException(`Tag with ID ${tagId} not found`);
        }

        // Verificar si ya está asignada
        const existing = await this.prisma.processInstanceTag.findUnique({
            where: {
                processInstanceId_tagId: {
                    processInstanceId,
                    tagId,
                },
            },
        });

        if (existing) {
            // Ya está asignada, retornar sin error
            return existing;
        }

        const assignment = await this.prisma.processInstanceTag.create({
            data: {
                processInstanceId,
                tagId,
            },
            include: {
                tag: true,
            },
        });

        // Registrar en bitácora
        await this.auditLog.log({
            action: AuditActions.ASSIGN,
            entityType: EntityTypes.TAG,
            entityId: tagId,
            description: `Etiqueta "${tag.name}" asignada al proceso #${processInstanceId}`,
            details: { processInstanceId, tagId, tagName: tag.name },
            userId,
        });

        return assignment;
    }

    // Remover una etiqueta de un proceso
    async removeFromProcess(processInstanceId: number, tagId: number, userId?: number) {
        const existing = await this.prisma.processInstanceTag.findUnique({
            where: {
                processInstanceId_tagId: {
                    processInstanceId,
                    tagId,
                },
            },
            include: { tag: true },
        });

        if (!existing) {
            throw new NotFoundException('Esta etiqueta no está asignada a este proceso');
        }

        await this.prisma.processInstanceTag.delete({
            where: {
                processInstanceId_tagId: {
                    processInstanceId,
                    tagId,
                },
            },
        });

        // Registrar en bitácora
        await this.auditLog.log({
            action: AuditActions.UNASSIGN,
            entityType: EntityTypes.TAG,
            entityId: tagId,
            description: `Etiqueta "${existing.tag.name}" removida del proceso #${processInstanceId}`,
            details: { processInstanceId, tagId, tagName: existing.tag.name },
            userId,
        });

        return existing;
    }

    // Obtener etiquetas de un proceso específico
    async getTagsByProcess(processInstanceId: number) {
        return this.prisma.processInstanceTag.findMany({
            where: { processInstanceId },
            include: {
                tag: true,
            },
        });
    }

    // Actualizar todas las etiquetas de un proceso (reemplazar)
    async setProcessTags(processInstanceId: number, tagIds: number[]) {
        // Eliminar todas las etiquetas actuales
        await this.prisma.processInstanceTag.deleteMany({
            where: { processInstanceId },
        });

        // Asignar las nuevas etiquetas
        if (tagIds.length > 0) {
            await this.prisma.processInstanceTag.createMany({
                data: tagIds.map((tagId) => ({
                    processInstanceId,
                    tagId,
                })),
                skipDuplicates: true,
            });
        }

        // Retornar las etiquetas actualizadas
        return this.getTagsByProcess(processInstanceId);
    }
}
