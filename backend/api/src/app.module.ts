import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { R2Module } from './r2/r2.module';
import { ProcessCategoriesModule } from './process-categories/process-categories.module';
import { ProcessTypesModule } from './process-types/process-types.module';
import { ProcessTemplatesModule } from './process-templates/process-templates.module';
import { ProcessInstancesModule } from './process-instances/process-instances.module';
import { StepFilesModule } from './step-files/step-files.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditLogModule } from './audit-log/audit-log.module';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    PrismaModule,
    R2Module, // Global module for R2 file storage
    AuditLogModule, // Global module for audit logging
    ProcessCategoriesModule,
    ProcessTypesModule,
    ProcessTemplatesModule,
    ProcessInstancesModule,
    StepFilesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    // 1) Primero: todos los endpoints exigen JWT,
    // excepto los marcados como @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2) Segundo: sobre los endpoints protegidos,
    // se aplica el guard de roles si usas @Roles(...)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
