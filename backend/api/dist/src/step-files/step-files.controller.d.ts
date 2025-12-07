import { StepFilesService } from './step-files.service';
import type { Response } from 'express';
export declare class StepFilesController {
    private readonly stepFilesService;
    constructor(stepFilesService: StepFilesService);
    uploadFile(stepId: number, file: Express.Multer.File, req: any): Promise<{
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        uploadedAt: Date;
        id: number;
        stepId: number;
        uploadedById: number | null;
    }>;
    listFiles(stepId: number): Promise<{
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
    downloadFile(stepId: number, fileId: number, res: Response): Promise<void>;
    deleteFile(stepId: number, fileId: number): Promise<{
        success: boolean;
    }>;
}
