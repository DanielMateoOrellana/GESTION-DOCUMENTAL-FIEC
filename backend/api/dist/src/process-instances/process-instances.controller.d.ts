import { ProcessInstancesService } from './process-instances.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';
export declare class ProcessInstancesController {
    private readonly service;
    constructor(service: ProcessInstancesService);
    create(dto: CreateProcessInstanceDto, req: any): Promise<{
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
        year: number | null;
        month: number | null;
        responsibleUserId: number | null;
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
        responsibleUser: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            email: string;
            password: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
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
        year: number | null;
        month: number | null;
        responsibleUserId: number | null;
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
        responsibleUser: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            email: string;
            password: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
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
        year: number | null;
        month: number | null;
        responsibleUserId: number | null;
    }>;
}
