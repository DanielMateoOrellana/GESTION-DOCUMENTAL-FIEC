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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StepFilesService } from './step-files.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';

@Controller('steps')
@UseGuards(RolesGuard)
export class StepFilesController {
  constructor(private readonly stepFilesService: StepFilesService) { }

  @Post(':stepId/files')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR, UserRole.AYUDANTE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @Param('stepId', ParseIntPipe) stepId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo');
    }
    return this.stepFilesService.upload(stepId, file, req.user?.id);
  }

  @Get(':stepId/files')
  async listFiles(@Param('stepId', ParseIntPipe) stepId: number) {
    return this.stepFilesService.listByStep(stepId);
  }

  @Get(':stepId/files/:fileId/presigned')
  async getPresignedUrl(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ) {
    return this.stepFilesService.getPresignedUrl(stepId, fileId);
  }

  @Get(':stepId/files/:fileId')
  async downloadFile(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const { stream, fileName, mimeType, sizeBytes } =
      await this.stepFilesService.getFileStream(stepId, fileId, req.user?.id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', sizeBytes);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    stream.pipe(res);
  }

  @Delete(':stepId/files/:fileId')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR, UserRole.AYUDANTE)
  async deleteFile(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Req() req: any,
  ) {
    await this.stepFilesService.deleteFile(stepId, fileId, req.user?.id);
    return { success: true };
  }
}
