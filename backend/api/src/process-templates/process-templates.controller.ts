import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ProcessTemplatesService } from './process-templates.service';
import { CreateProcessTemplateDto } from './dto/create-process-template.dto';
import { UpdateProcessTemplateDto } from './dto/update-process-template.dto';

@Controller('process-templates')
export class ProcessTemplatesController {
  constructor(private readonly service: ProcessTemplatesService) { }

  @Post()
  create(@Body() dto: CreateProcessTemplateDto, @Req() req: any) {
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
    @Body() dto: UpdateProcessTemplateDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    return this.service.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    return this.service.remove(id, userId, userRole);
  }
}
