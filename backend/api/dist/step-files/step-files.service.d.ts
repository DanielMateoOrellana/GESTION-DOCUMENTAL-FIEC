import { PrismaService } from '../prisma/prisma.service';
export declare class StepFilesService {
    private prisma;
    constructor(prisma: PrismaService);
    upload(stepId: number, file: Express.Multer.File, userId?: number): Promise<{
        id: number;
        stepId: number;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        uploadedById: number | null;
        uploadedAt: Date;
    }>;
    listByStep(stepId: number): Promise<{
        id: number;
        stepId: number;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        uploadedById: number | null;
        uploadedAt: Date;
    }[]>;
    getFile(stepId: number, fileId: number): Promise<{
        id: number;
        stepId: number;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        content: import("@prisma/client/runtime/library").Bytes;
        uploadedById: number | null;
        uploadedAt: Date;
    }>;
}
