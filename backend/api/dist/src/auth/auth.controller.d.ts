import { AuthService } from './auth.service';
import { UserRole } from '@prisma/client';
declare class RegisterBodyDto {
    email: string;
    password: string;
    fullName: string;
    role?: UserRole;
}
declare class LoginBodyDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterBodyDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    login(body: LoginBodyDto): Promise<{
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
    me(req: any): any;
}
export {};
