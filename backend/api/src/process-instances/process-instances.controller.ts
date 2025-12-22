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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProcessInstancesService } from './process-instances.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';
import { ImportProcessDto } from './dto/import-process.dto';
import { BulkExportDto } from './dto/bulk-export.dto';
import type { Response } from 'express';

@Controller('process-instances')
export class ProcessInstancesController {
  constructor(private readonly service: ProcessInstancesService) { }

  @Post()
  create(@Body() dto: CreateProcessInstanceDto, @Req() req: any) {
    const userId = req.user?.id; // viene del JWT

    // por si algún día llamas esto sin auth (no deberías)
    if (!userId) {
      // puedes lanzar aquí una excepción, pero JwtAuthGuard debería evitar llegar aquí
      throw new Error('Usuario no autenticado');
    }

    return this.service.create(dto, userId);
  }

  /**
   * Importa un proceso desde un archivo ZIP
   */
  @Post('import-zip')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB máximo
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
      throw new Error('Usuario no autenticado');
    }

    return this.service.importZip(file, dto, userId);
  }

  /**
   * Exporta múltiples expedientes en un único archivo ZIP
   */
  @Post('bulk-export-zip')
  async bulkExportZip(@Body() dto: BulkExportDto, @Res() res: Response) {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `Expedientes_${timestamp}`;

    // Configurar headers para descarga de ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}.zip"`,
    );

    // Generar y enviar el ZIP con múltiples procesos
    await this.service.generateBulkZip(dto.ids, res);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /**
   * Descarga el expediente completo como archivo ZIP
   */
  @Get(':id/zip')
  async downloadZip(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    // Primero obtenemos info del proceso para el nombre del archivo
    const process = await this.service.findOne(id);

    const sanitizeName = (name: string): string => {
      return name
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 50);
    };

    const fileName = sanitizeName(
      process.title || `Expediente_${process.id}`
    );

    // Configurar headers para descarga de ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}.zip"`,
    );

    // Generar y enviar el ZIP
    await this.service.generateZip(id, res);
  }

  /**
   * Elimina una instancia de proceso y todos sus archivos
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.remove(id, userId);
  }
}

