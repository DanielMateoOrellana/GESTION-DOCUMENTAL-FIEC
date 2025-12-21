import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StepFilesService } from './step-files.service';
import type { Response } from 'express';

@Controller('steps')
export class StepFilesController {
  constructor(private readonly stepFilesService: StepFilesService) { }

  @Post(':stepId/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async uploadFile(
    @Param('stepId', ParseIntPipe) stepId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo (campo "file")');
    }

    const userId = req.user?.id;

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
    @Req() req: any,
  ) {
    const userId = req.user?.id;

    // Obtener stream desde R2
    const { stream, fileName, mimeType, sizeBytes } =
      await this.stepFilesService.getFileStream(stepId, fileId, userId);

    // Configurar headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', sizeBytes);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );

    // Pipe el stream directamente a la respuesta
    stream.pipe(res);
  }

  @Delete(':stepId/files/:fileId')
  async deleteFile(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    await this.stepFilesService.deleteFile(stepId, fileId, userId);
    return { success: true };
  }
}
