import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProcessCategoriesModule } from './process-categories/process-categories.module';
import { ProcessTypesModule } from './process-types/process-types.module';
import { ProcessTemplatesModule } from './process-templates/process-templates.module';
import { ProcessInstancesModule } from './process-instances/process-instances.module';
import { StepFilesModule } from './step-files/step-files.module';
// luego agregaremos los otros módulos aquí

@Module({
  imports: [PrismaModule, ProcessCategoriesModule, ProcessTypesModule, ProcessTemplatesModule, ProcessInstancesModule, StepFilesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
