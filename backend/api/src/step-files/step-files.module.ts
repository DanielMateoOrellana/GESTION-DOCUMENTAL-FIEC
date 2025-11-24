import { Module } from '@nestjs/common';
import { StepFilesService } from './step-files.service';
import { StepFilesController } from './step-files.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [StepFilesController],
  providers: [StepFilesService, PrismaService],
  exports: [StepFilesService],
})
export class StepFilesModule {}
