import { Module } from '@nestjs/common';
import { ProcessInstancesService } from './process-instances.service';
import { ProcessInstancesController } from './process-instances.controller';

@Module({
  providers: [ProcessInstancesService],
  controllers: [ProcessInstancesController]
})
export class ProcessInstancesModule {}
