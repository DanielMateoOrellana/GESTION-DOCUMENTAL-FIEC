import { Module } from '@nestjs/common';
import { ProcessTemplatesService } from './process-templates.service';
import { ProcessTemplatesController } from './process-templates.controller';

@Module({
  controllers: [ProcessTemplatesController],
  providers: [ProcessTemplatesService],
})
export class ProcessTemplatesModule {}
