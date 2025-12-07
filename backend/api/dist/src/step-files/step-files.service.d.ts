import { PrismaService } from '../prisma/prisma.service';
export declare class StepFilesService {
    private prisma;
    constructor(prisma: PrismaService);
    upload(stepId: number, file: Express.Multer.File, userId?: number): Promise<{
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        uploadedAt: Date;
        id: number;
        stepId: number;
        uploadedById: number | null;
    }>;
    listByStep(stepId: number): Promise<{
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        uploadedAt: Date;
        uploadedBy: {
            id: number;
            email: string;
            fullName: string;
        } | null;
        id: number;
        stepId: number;
        uploadedById: number | null;
    }[]>;
    getFile(stepId: number, fileId: number): Promise<{
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        content: import("@prisma/client/runtime/library").Bytes;
        uploadedAt: Date;
        id: number;
        stepId: number;
        uploadedById: number | null;
    }>;
    deleteFile(stepId: number, fileId: number): Promise<void>;
}
