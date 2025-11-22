import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',        // Vite dev
      'https://gestion-documental-fiec.vercel.app/',    // luego pones tu URL real
    ],
    credentials: false,
  });

  await app.listen(4000);
}
bootstrap();
