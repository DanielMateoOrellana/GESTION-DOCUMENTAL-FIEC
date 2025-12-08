import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.prisma.user.create({
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

    async update(id: number, updateUserDto: UpdateUserDto) {
        const data: any = { ...updateUserDto };
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return this.prisma.user.update({
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
    }

    async remove(id: number) {
        // Soft delete / deactivate
        return this.update(id, { isActive: false });
    }
}
