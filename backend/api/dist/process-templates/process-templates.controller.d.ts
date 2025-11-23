import { ProcessTemplatesService } from './process-templates.service';
import { CreateProcessTemplateDto } from './dto/create-process-template.dto';
import { UpdateProcessTemplateDto } from './dto/update-process-template.dto';
export declare class ProcessTemplatesController {
    private readonly service;
    constructor(service: ProcessTemplatesService);
    create(dto: CreateProcessTemplateDto): Promise<{
        processType: {
            category: {
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
            };
        } & {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number;
        };
        steps: {
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
        }[];
    } & {
        name: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        processType: {
            category: {
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
            };
        } & {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number;
        };
        steps: {
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
        }[];
    } & {
        name: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
    })[]>;
    findOne(id: number): Promise<{
        processType: {
            category: {
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
            };
        } & {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number;
        };
        steps: {
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
        }[];
    } & {
        name: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
    }>;
    update(id: number, dto: UpdateProcessTemplateDto): Promise<{
        processType: {
            category: {
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
            };
        } & {
            name: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number;
        };
        steps: {
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
        }[];
    } & {
        name: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        processTypeId: number;
    }>;
}
