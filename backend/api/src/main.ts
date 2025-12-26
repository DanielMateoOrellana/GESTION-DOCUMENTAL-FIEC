import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Crear la aplicación con tipo Express explícito para acceder a métodos específicos
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Helmet para seguridad
  app.use(helmet());
  logger.log('Helmet configurado');

  // ══════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN DE PROXY/LOAD BALANCER (CRÍTICO PARA RENDER)
  // ══════════════════════════════════════════════════════════════════════════
  // Render (y la mayoría de plataformas cloud) usan un balanceador de carga/proxy
  // que envía la IP real del cliente en el header X-Forwarded-For.
  // Sin esta configuración, todos los usuarios aparecerían con la misma IP (la del proxy)
  // y el rate limiting bloquearía a todos después de pocas peticiones.
  // 
  // 'trust proxy' = 1 significa confiar en el primer proxy (el de Render)
  // Esto permite que Express use X-Forwarded-For para req.ip
  // ══════════════════════════════════════════════════════════════════════════
  app.set('trust proxy', 1);
  logger.log('Proxy trust configurado (X-Forwarded-For habilitado)');

  // CORS configurado para permitir orígenes específicos en producción
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como Postman, curl, o server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }
      // En desarrollo, permitir cualquier localhost
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
        return;
      }
      // En producción, verificar contra lista de orígenes permitidos
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // Si no hay ALLOWED_ORIGINS definido, permitir todo (desarrollo)
      if (allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS no permitido para este origen'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Backend escuchando en puerto ${port}`);
  logger.log(`Rate limiting activo: 100 req/min por IP`);
}
bootstrap();
