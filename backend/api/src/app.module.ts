import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

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
    // ══════════════════════════════════════════════════════════════════════════
    // RATE LIMITING - Protección contra abuso de API
    // ══════════════════════════════════════════════════════════════════════════
    // Configuración de múltiples ventanas de tiempo para diferentes niveles de protección:
    // 
    // 1. SHORT: 10 requests por 1 segundo (protección contra bursts)
    //    - Previene ráfagas rápidas de peticiones
    //    - Útil contra scripts automatizados simples
    //
    // 2. MEDIUM: 100 requests por 1 minuto (uso normal)
    //    - Límite razonable para uso normal de la aplicación
    //    - Un usuario típico no debería alcanzar este límite
    //
    // 3. LONG: 1000 requests por 15 minutos (protección sostenida)
    //    - Previene abuso prolongado
    //    - Permite uso intensivo legítimo pero limita ataques
    // ══════════════════════════════════════════════════════════════════════════
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,      // 1 segundo
        limit: 10,      // máximo 10 requests
      },
      {
        name: 'medium',
        ttl: 60000,     // 1 minuto (60 segundos)
        limit: 100,     // máximo 100 requests
      },
      {
        name: 'long',
        ttl: 900000,    // 15 minutos
        limit: 1000,    // máximo 1000 requests
      },
    ]),

    // Módulos de la aplicación
    PrismaModule,
    R2Module,
    AuditLogModule,
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
    // ══════════════════════════════════════════════════════════════════════════
    // GUARDS GLOBALES (orden de ejecución)
    // ══════════════════════════════════════════════════════════════════════════

    // 1) Rate Limiting: Se ejecuta PRIMERO para rechazar peticiones
    //    antes de cualquier procesamiento (ahorra recursos)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // 2) JWT Auth: Todos los endpoints exigen JWT,
    //    excepto los marcados como @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // 3) Roles: Sobre los endpoints protegidos,
    //    se aplica el guard de roles si usas @Roles(...)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
