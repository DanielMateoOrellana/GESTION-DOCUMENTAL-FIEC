import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProcessCategoriesModule } from './process-categories/process-categories.module';
import { ProcessTypesModule } from './process-types/process-types.module';
// luego agregaremos los otros módulos aquí

@Module({
  imports: [PrismaModule, ProcessCategoriesModule, ProcessTypesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
