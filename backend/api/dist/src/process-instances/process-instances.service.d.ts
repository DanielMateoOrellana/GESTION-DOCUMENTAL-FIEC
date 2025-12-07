import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';
export declare class ProcessInstancesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProcessInstanceDto, userId: number): Promise<{
        processType: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string;
            isActive: boolean;
            categoryId: number;
        };
        template: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            processTypeId: number;
            name: string;
            description: string;
            isActive: boolean;
        };
        steps: {
            title: string;
            estado: import("@prisma/client").$Enums.EstadoPaso;
            comment: string | null;
            dueAt: Date | null;
            completedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            templateStepId: number;
            processInstanceId: number;
        }[];
    } & {
        title: string;
        estado: import("@prisma/client").$Enums.EstadoProceso;
        year: number | null;
        month: number | null;
        comment: string | null;
        dueAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
        templateId: number;
        responsibleUserId: number | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        processType: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string;
            isActive: boolean;
            categoryId: number;
        };
        template: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            processTypeId: number;
            name: string;
            description: string;
            isActive: boolean;
        };
        responsibleUser: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            isActive: boolean;
            email: string;
            password: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
        steps: {
            title: string;
            estado: import("@prisma/client").$Enums.EstadoPaso;
            comment: string | null;
            dueAt: Date | null;
            completedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            templateStepId: number;
            processInstanceId: number;
        }[];
    } & {
        title: string;
        estado: import("@prisma/client").$Enums.EstadoProceso;
        year: number | null;
        month: number | null;
        comment: string | null;
        dueAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
        templateId: number;
        responsibleUserId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        processType: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string;
            isActive: boolean;
            categoryId: number;
        };
        template: {
            processType: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string;
                isActive: boolean;
                categoryId: number;
            };
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            processTypeId: number;
            name: string;
            description: string;
            isActive: boolean;
        };
        responsibleUser: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            isActive: boolean;
            email: string;
            password: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
        steps: ({
            templateStep: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                templateId: number;
                name: string;
                description: string | null;
                order: number;
                responsibleRole: string | null;
                dueDaysFromStart: number | null;
                isMandatory: boolean;
            };
        } & {
            title: string;
            estado: import("@prisma/client").$Enums.EstadoPaso;
            comment: string | null;
            dueAt: Date | null;
            completedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            templateStepId: number;
            processInstanceId: number;
        })[];
    } & {
        title: string;
        estado: import("@prisma/client").$Enums.EstadoProceso;
        year: number | null;
        month: number | null;
        comment: string | null;
        dueAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
        templateId: number;
        responsibleUserId: number | null;
    }>;
}
