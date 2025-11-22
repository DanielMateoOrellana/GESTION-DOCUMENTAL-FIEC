import { Module } from '@nestjs/common';
import { ProcessCategoriesService } from './process-categories.service';
import { ProcessCategoriesController } from './process-categories.controller';

@Module({
  providers: [ProcessCategoriesService],
  controllers: [ProcessCategoriesController]
})
export class ProcessCategoriesModule {}
