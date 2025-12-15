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
import { ProcessTypesService } from './process-types.service';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { UpdateProcessTypeDto } from './dto/update-process-type.dto';

@Controller('process-types')
export class ProcessTypesController {
  constructor(private readonly service: ProcessTypesService) { }

  @Post()
  create(@Body() dto: CreateProcessTypeDto, @Req() req: any) {
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
    @Body() dto: UpdateProcessTypeDto,
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
