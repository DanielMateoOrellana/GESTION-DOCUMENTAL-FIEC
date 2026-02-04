import { Controller, Get, Param, Res, UseGuards, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FolderDownloadService } from './folder-download.service';

@Controller('folder-download')
@UseGuards(JwtAuthGuard)
export class FolderDownloadController {
    constructor(private readonly folderDownloadService: FolderDownloadService) { }

    @Get(':type/:id')
    async downloadFolder(
        @Param('type') type: string,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const validTypes = ['category', 'processType', 'process', 'step'];

        if (!validTypes.includes(type)) {
            throw new BadRequestException(`Tipo inválido. Debe ser uno de: ${validTypes.join(', ')}`);
        }

        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new BadRequestException('ID debe ser un número');
        }

        const { stream, filename } = await this.folderDownloadService.downloadFolder(
            type as 'category' | 'processType' | 'process' | 'step',
            numericId,
        );

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

        stream.pipe(res);
    }

    @Get(':type/:id/count')
    async countFiles(
        @Param('type') type: string,
        @Param('id') id: string,
    ) {
        const validTypes = ['category', 'processType', 'process', 'step'];

        if (!validTypes.includes(type)) {
            throw new BadRequestException(`Tipo inválido. Debe ser uno de: ${validTypes.join(', ')}`);
        }

        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new BadRequestException('ID debe ser un número');
        }

        const count = await this.folderDownloadService.countFilesInFolder(
            type as 'category' | 'processType' | 'process' | 'step',
            numericId,
        );

        return { count };
    }
}
