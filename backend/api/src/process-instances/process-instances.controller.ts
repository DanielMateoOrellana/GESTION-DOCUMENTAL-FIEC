import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProcessInstancesService } from './process-instances.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';
import { ImportProcessDto } from './dto/import-process.dto';
import { BulkExportDto } from './dto/bulk-export.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';

@Controller('process-instances')
@UseGuards(RolesGuard)
export class ProcessInstancesController {
  constructor(private readonly service: ProcessInstancesService) { }

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR, UserRole.AYUDANTE)
  create(@Body() dto: CreateProcessInstanceDto, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }
    return this.service.create(dto, userId);
  }

  @Post('import-zip')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR, UserRole.AYUDANTE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (
          file.mimetype === 'application/zip' ||
          file.mimetype === 'application/x-zip-compressed' ||
          file.originalname.endsWith('.zip')
        ) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se aceptan archivos ZIP'), false);
        }
      },
    }),
  )
  async importZip(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportProcessDto,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo ZIP');
    }
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }
    return this.service.importZip(file, dto, userId);
  }

  @Post('bulk-export-zip')
  async bulkExportZip(@Body() dto: BulkExportDto, @Res() res: Response) {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `Expedientes_${timestamp}`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}.zip"`,
    );
    await this.service.generateBulkZip(dto.ids, res);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user?.id, req.user?.role);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findOne(id, req.user?.id, req.user?.role);
  }

  @Get(':id/zip')
  async downloadZip(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const process = await this.service.findOne(id, req.user?.id, req.user?.role);

    const sanitizeName = (name: string): string =>
      name.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_').substring(0, 50);

    const fileName = sanitizeName(process.title || `Expediente_${process.id}`);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}.zip"`,
    );
    await this.service.generateZip(id, res);
  }

  @Post(':id/add-step')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR)
  async addStep(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') stepName: string,
    @Req() req: any,
  ) {
    if (!stepName?.trim()) {
      throw new BadRequestException('El nombre del paso es requerido');
    }
    return this.service.addStep(id, stepName.trim(), req.user?.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.service.findOne(id, req.user?.id, req.user?.role);
    return this.service.remove(id, req.user?.id);
  }
}
