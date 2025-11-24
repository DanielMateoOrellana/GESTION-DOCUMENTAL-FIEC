import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StepFilesService } from './step-files.service';
import type { Response } from 'express';

@Controller('steps')
export class StepFilesController {
  constructor(private readonly stepFilesService: StepFilesService) {}

  @Post(':stepId/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFile(
    @Param('stepId', ParseIntPipe) stepId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo (campo "file")');
    }

    // TODO: sacar user real de JWT
    const userId = 1;

    return this.stepFilesService.upload(stepId, file, userId);
  }

  @Get(':stepId/files')
  async listFiles(@Param('stepId', ParseIntPipe) stepId: number) {
    return this.stepFilesService.listByStep(stepId);
  }

  @Get(':stepId/files/:fileId')
  async downloadFile(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res() res: Response,
  ) {
    const file = await this.stepFilesService.getFile(stepId, fileId);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    );

    res.send(Buffer.from(file.content));
  }
}
