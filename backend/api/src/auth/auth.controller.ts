import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService, LoginDto, RegisterDto } from './auth.service';
import { UserRole } from '@prisma/client';
import { Public } from './public.decorator';
import { Throttle } from '@nestjs/throttler';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

class RegisterBodyDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

class LoginBodyDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ══════════════════════════════════════════════════════════════════════════
  // REGISTRO - Rate limiting estricto para prevenir spam de cuentas
  // ══════════════════════════════════════════════════════════════════════════
  // Límite: 5 registros por minuto por IP
  // Esto previene la creación masiva de cuentas falsas
  // ══════════════════════════════════════════════════════════════════════════
  @Public()
  @Post('register')
  @Throttle({
    short: { limit: 3, ttl: 1000 },     // 3 por segundo (muy estricto)
    medium: { limit: 5, ttl: 60000 },   // 5 por minuto
    long: { limit: 20, ttl: 900000 },   // 20 en 15 minutos
  })
  register(@Body() body: RegisterBodyDto) {
    const dto: RegisterDto = {
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      role: body.role,
    };
    return this.authService.register(dto);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN - Rate limiting MUY estricto para prevenir fuerza bruta
  // ══════════════════════════════════════════════════════════════════════════
  // Límite: 5 intentos de login por minuto por IP
  // Esto hace prácticamente imposible un ataque de fuerza bruta
  // 5 intentos/min = 300 intentos/hora = muy poco para romper contraseñas
  // ══════════════════════════════════════════════════════════════════════════
  @Public()
  @Post('login')
  @Throttle({
    short: { limit: 3, ttl: 1000 },     // 3 por segundo
    medium: { limit: 5, ttl: 60000 },   // 5 por minuto
    long: { limit: 30, ttl: 900000 },   // 30 en 15 minutos
  })
  login(@Body() body: LoginBodyDto) {
    const dto: LoginDto = {
      email: body.email,
      password: body.password,
    };
    return this.authService.login(dto);
  }

  @Get('me')
  me(@Req() req: any) {
    return req.user; // viene del jwt.strategy
  }
}
