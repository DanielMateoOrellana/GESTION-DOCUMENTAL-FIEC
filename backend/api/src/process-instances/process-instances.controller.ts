import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { ProcessInstancesService } from './process-instances.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';

@Controller('process-instances')
export class ProcessInstancesController {
  constructor(private readonly service: ProcessInstancesService) {}

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

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
