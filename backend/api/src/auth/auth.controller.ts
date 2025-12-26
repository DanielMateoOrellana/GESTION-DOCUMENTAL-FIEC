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

  @Public()
  @Post('register')
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 5, ttl: 60000 },
    long: { limit: 20, ttl: 900000 },
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

  @Public()
  @Post('login')
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 5, ttl: 60000 },
    long: { limit: 30, ttl: 900000 },
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
    return req.user;
  }
}
