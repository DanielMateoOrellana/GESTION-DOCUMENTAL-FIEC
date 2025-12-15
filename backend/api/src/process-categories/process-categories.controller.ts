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
} from '@nestjs/common';
import { ProcessCategoriesService } from './process-categories.service';
import { CreateProcessCategoryDto } from './dto/create-process-category.dto';
import { UpdateProcessCategoryDto } from './dto/update-process-category.dto';

@Controller('process-categories')
export class ProcessCategoriesController {
  constructor(private readonly service: ProcessCategoriesService) { }

  @Post()
  create(@Body() dto: CreateProcessCategoryDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.create(dto, userId);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProcessCategoryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.remove(id, userId);
  }
}
