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

  /**
   * Crea un nuevo proceso.
   * LECTOR no puede crear procesos.
   */
  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR, UserRole.AYUDANTE)
  create(@Body() dto: CreateProcessInstanceDto, @Req() req: any) {
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    return this.service.create(dto, userId);
  }

  /**
   * Importa un proceso desde un archivo ZIP.
   * LECTOR no puede importar procesos.
   */
  @Post('import-zip')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR, UserRole.AYUDANTE)
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
      throw new ForbiddenException('Usuario no autenticado');
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

  /**
   * Lista todos los procesos.
   * Filtrado por rol: usuarios normales solo ven sus propios procesos.
   */
  @Get()
  findAll(@Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    return this.service.findAll(userId, userRole);
  }

  /**
   * Obtiene un proceso por ID.
   * Verificación de acceso según rol.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    return this.service.findOne(id, userId, userRole);
  }

  /**
   * Descarga el expediente completo como archivo ZIP
   */
  @Get(':id/zip')
  async downloadZip(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Primero obtenemos info del proceso (con verificación de acceso)
    const process = await this.service.findOne(id, userId, userRole);

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
   * Agrega un paso dinámico a una instancia de proceso.
   * También lo agrega a la plantilla asociada.
   * Solo ADMINISTRADOR y GESTOR pueden agregar pasos.
   */
  @Post(':id/add-step')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR)
  async addStep(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') stepName: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id;

    if (!stepName || !stepName.trim()) {
      throw new BadRequestException('El nombre del paso es requerido');
    }

    return this.service.addStep(id, stepName.trim(), userId);
  }

  /**
   * Elimina una instancia de proceso y todos sus archivos.
   * LECTOR no puede eliminar procesos.
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Verificar acceso al proceso antes de eliminar
    await this.service.findOne(id, userId, userRole);

    return this.service.remove(id, userId);
  }
}

