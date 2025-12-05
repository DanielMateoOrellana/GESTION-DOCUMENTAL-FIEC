import { StepFilesService } from './step-files.service';
import type { Response } from 'express';
export declare class StepFilesController {
    private readonly stepFilesService;
    constructor(stepFilesService: StepFilesService);
    uploadFile(stepId: number, file: Express.Multer.File): Promise<{
        id: number;
        stepId: number;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        uploadedById: number | null;
        uploadedAt: Date;
    }>;
    listFiles(stepId: number): Promise<{
        id: number;
        stepId: number;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        version: number;
        uploadedById: number | null;
        uploadedAt: Date;
    }[]>;
    downloadFile(stepId: number, fileId: number, res: Response): Promise<void>;
}
