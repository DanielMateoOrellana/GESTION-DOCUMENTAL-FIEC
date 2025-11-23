import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProcessInstancesService } from './process-instances.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';

@Controller('process-instances')
export class ProcessInstancesController {
  constructor(private readonly service: ProcessInstancesService) {}

  @Post()
  create(@Body() dto: CreateProcessInstanceDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
