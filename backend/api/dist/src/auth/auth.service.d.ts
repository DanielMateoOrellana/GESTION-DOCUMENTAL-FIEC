import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export interface RegisterDto {
    email: string;
    password: string;
    fullName: string;
    role?: UserRole;
}
export interface LoginDto {
    email: string;
    password: string;
}
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    register(dto: RegisterDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    private validateUser;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
}
