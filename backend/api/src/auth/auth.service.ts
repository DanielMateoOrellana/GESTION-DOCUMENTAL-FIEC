import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole; // ADMINISTRADOR | GESTOR | LECTOR | AYUDANTE
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) { }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        fullName: dto.fullName,
        role: dto.role ?? UserRole.LECTOR,
      },
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.CREATE,
      entityType: EntityTypes.USER,
      entityId: user.id,
      description: `Usuario "${user.fullName}" registrado`,
      details: { email: user.email, role: user.role },
      userId: user.id, // El usuario mismo se registró
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  private async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    // Nota: Auditoría de LOGIN removida - no está en whitelist

    return {
      access_token: token,
      user,
    };
  }
}
