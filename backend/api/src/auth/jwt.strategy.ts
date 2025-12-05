import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'cámbiame-en-.env',
    });
  }

  async validate(payload: any) {
    // Lo que retorne esto termina en request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
