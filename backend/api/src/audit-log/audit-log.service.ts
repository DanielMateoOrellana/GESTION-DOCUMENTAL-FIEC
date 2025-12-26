import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
    action: string;
    entityType: string;
    entityId?: number;
    description: string;
    details?: Record<string, any>;
    userId?: number;
    ipAddress?: string;
}

export interface AuditLogFilter {
    action?: string;
    entityType?: string;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

export const AuditActions = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    UPLOAD: 'UPLOAD',
    DOWNLOAD: 'DOWNLOAD',
    ASSIGN: 'ASSIGN',
    UNASSIGN: 'UNASSIGN',
    COMPLETE: 'COMPLETE',
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
} as const;

export const EntityTypes = {
    USER: 'USER',
    PROCESS_CATEGORY: 'PROCESS_CATEGORY',
    PROCESS_TYPE: 'PROCESS_TYPE',
    PROCESS_TEMPLATE: 'PROCESS_TEMPLATE',
    TEMPLATE_STEP: 'TEMPLATE_STEP',
    PROCESS_INSTANCE: 'PROCESS_INSTANCE',
    STEP_INSTANCE: 'STEP_INSTANCE',
    TAG: 'TAG',
    FILE: 'FILE',
    SESSION: 'SESSION',
} as const;

@Injectable()
export class AuditLogService {
    constructor(private prisma: PrismaService) { }

    async log(dto: CreateAuditLogDto) {
        try {
            return await this.prisma.auditLog.create({
                data: {
                    action: dto.action,
                    entityType: dto.entityType,
                    entityId: dto.entityId ?? null,
                    description: dto.description,
                    details: dto.details ? JSON.stringify(dto.details) : null,
                    userId: dto.userId ?? null,
                    ipAddress: dto.ipAddress ?? null,
                },
            });
        } catch (error) {
            console.error('[AuditLog] Error:', error);
            return null;
        }
    }

    async findAll(filter: AuditLogFilter = {}) {
        const where: any = {};

        if (filter.action) where.action = filter.action;
        if (filter.entityType) where.entityType = filter.entityType;
        if (filter.userId) where.userId = filter.userId;

        if (filter.startDate || filter.endDate) {
            where.createdAt = {};
            if (filter.startDate) where.createdAt.gte = filter.startDate;
            if (filter.endDate) where.createdAt.lte = filter.endDate;
        }

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: filter.limit ?? 100,
                skip: filter.offset ?? 0,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data,
            total,
            limit: filter.limit ?? 100,
            offset: filter.offset ?? 0,
        };
    }

    async findOne(id: number) {
        return this.prisma.auditLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true, role: true },
                },
            },
        });
    }

    async getStats() {
        const [totalLogs, byAction, byEntityType, recentActivity] =
            await Promise.all([
                this.prisma.auditLog.count(),
                this.prisma.auditLog.groupBy({
                    by: ['action'],
                    _count: { action: true },
                    orderBy: { _count: { action: 'desc' } },
                }),
                this.prisma.auditLog.groupBy({
                    by: ['entityType'],
                    _count: { entityType: true },
                    orderBy: { _count: { entityType: 'desc' } },
                }),
                this.prisma.auditLog.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { id: true, fullName: true } },
                    },
                }),
            ]);

        return {
            totalLogs,
            byAction: byAction.map((a) => ({
                action: a.action,
                count: a._count.action,
            })),
            byEntityType: byEntityType.map((e) => ({
                entityType: e.entityType,
                count: e._count.entityType,
            })),
            recentActivity,
        };
    }

    async getActionTypes() {
        const result = await this.prisma.auditLog.findMany({
            distinct: ['action'],
            select: { action: true },
        });
        return result.map((r) => r.action);
    }

    async getEntityTypes() {
        const result = await this.prisma.auditLog.findMany({
            distinct: ['entityType'],
            select: { entityType: true },
        });
        return result.map((r) => r.entityType);
    }
}
