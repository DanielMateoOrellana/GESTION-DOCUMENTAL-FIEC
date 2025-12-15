import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private auditLog: AuditLogService,
    ) { }

    async create(createUserDto: CreateUserDto, createdByUserId?: number) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                createdAt: true,
            }
        });

        // Registrar en bitácora
        await this.auditLog.log({
            action: AuditActions.CREATE,
            entityType: EntityTypes.USER,
            entityId: user.id,
            description: `Usuario "${user.fullName}" (${user.email}) creado`,
            details: { email: user.email, role: user.role },
            userId: createdByUserId,
        });

        return user;
    }

    findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    findOne(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto, updatedByUserId?: number) {
        const data: any = { ...updateUserDto };
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // Registrar en bitácora
        const changedFields = Object.keys(updateUserDto).filter(k => k !== 'password');
        await this.auditLog.log({
            action: AuditActions.UPDATE,
            entityType: EntityTypes.USER,
            entityId: user.id,
            description: `Usuario "${user.fullName}" actualizado`,
            details: { changedFields, email: user.email },
            userId: updatedByUserId,
        });

        return user;
    }

    async remove(id: number, deletedByUserId?: number) {
        const user = await this.findOne(id);

        // Registrar en bitácora
        await this.auditLog.log({
            action: AuditActions.DEACTIVATE,
            entityType: EntityTypes.USER,
            entityId: id,
            description: `Usuario "${user?.fullName}" desactivado`,
            userId: deletedByUserId,
        });

        // Soft delete / deactivate
        return this.update(id, { isActive: false }, deletedByUserId);
    }
}
