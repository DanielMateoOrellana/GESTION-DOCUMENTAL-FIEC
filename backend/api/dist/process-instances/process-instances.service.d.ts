import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';
export declare class ProcessInstancesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProcessInstanceDto): Promise<{
        processType: {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number;
        };
        steps: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            title: string;
            estado: import("@prisma/client").$Enums.EstadoPaso;
            comment: string | null;
            dueAt: Date | null;
            completedAt: Date | null;
            processInstanceId: number;
            templateStepId: number;
        }[];
        template: {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            processTypeId: number;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
        title: string;
        estado: import("@prisma/client").$Enums.EstadoProceso;
        comment: string | null;
        dueAt: Date | null;
        completedAt: Date | null;
        templateId: number;
        responsibleUserId: number | null;
        year: number | null;
        month: number | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        processType: {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number;
        };
        steps: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            title: string;
            estado: import("@prisma/client").$Enums.EstadoPaso;
            comment: string | null;
            dueAt: Date | null;
            completedAt: Date | null;
            processInstanceId: number;
            templateStepId: number;
        }[];
        template: {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            processTypeId: number;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
        title: string;
        estado: import("@prisma/client").$Enums.EstadoProceso;
        comment: string | null;
        dueAt: Date | null;
        completedAt: Date | null;
        templateId: number;
        responsibleUserId: number | null;
        year: number | null;
        month: number | null;
    })[]>;
    findOne(id: number): Promise<{
        processType: {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number;
        };
        steps: ({
            templateStep: {
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                order: number;
                responsibleRole: string | null;
                dueDaysFromStart: number | null;
                isMandatory: boolean;
                templateId: number;
            };
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            title: string;
            estado: import("@prisma/client").$Enums.EstadoPaso;
            comment: string | null;
            dueAt: Date | null;
            completedAt: Date | null;
            processInstanceId: number;
            templateStepId: number;
        })[];
        template: {
            processType: {
                name: string;
                description: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                categoryId: number;
            };
        } & {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            processTypeId: number;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
        title: string;
        estado: import("@prisma/client").$Enums.EstadoProceso;
        comment: string | null;
        dueAt: Date | null;
        completedAt: Date | null;
        templateId: number;
        responsibleUserId: number | null;
        year: number | null;
        month: number | null;
    }>;
}
