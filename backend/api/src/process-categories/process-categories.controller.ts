import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProcessCategoriesService } from './process-categories.service';
import { CreateProcessCategoryDto } from './dto/create-process-category.dto';
import { UpdateProcessCategoryDto } from './dto/update-process-category.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('process-categories')
@UseGuards(RolesGuard)
export class ProcessCategoriesController {
  constructor(private readonly service: ProcessCategoriesService) { }

  /**
   * Crea una nueva categoría.
   * Solo ADMINISTRADOR y GESTOR pueden crear.
   */
  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR)
  create(@Body() dto: CreateProcessCategoryDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.create(dto, userId);
  }

  /**
   * Lista todas las categorías.
   * Todos los roles autenticados pueden leer.
   */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /**
   * Actualiza una categoría.
   * Solo ADMINISTRADOR y GESTOR pueden actualizar.
   */
  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProcessCategoryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.service.update(id, dto, userId);
  }

  /**
   * Elimina una categoría.
   * Solo ADMINISTRADOR y GESTOR pueden eliminar.
   * Lanza ConflictException si tiene tipos asociados.
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.GESTOR)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.remove(id, userId);
  }
}

