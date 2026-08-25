import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private refreshTokens = new Set<string>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre,
    };

    const secret = process.env.JWT_SECRET || 'cambia_este_secreto_jwt_santa_cruz';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'cambia_este_secreto_refresh_santa_cruz';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    this.refreshTokens.add(refreshToken);

    const userObj = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol as 'ADMIN' | 'VENDEDOR',
    };

    return {
      accessToken,
      refreshToken,
      usuario: userObj,
      user: userObj,
    };
  }

  async refresh(refreshToken: string) {
    if (!this.refreshTokens.has(refreshToken)) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const secret = process.env.JWT_SECRET || 'cambia_este_secreto_jwt_santa_cruz';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'cambia_este_secreto_refresh_santa_cruz';

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, rol: payload.rol, nombre: payload.nombre },
        { secret, expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
      );

      return { accessToken };
    } catch {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Refresh token expirado');
    }
  }

  async logout(refreshToken: string) {
    this.refreshTokens.delete(refreshToken);
    return { message: 'Sesión cerrada correctamente' };
  }
}
