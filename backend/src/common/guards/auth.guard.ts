import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DemoDataService } from '../../demo/demo-data.service';
import { COOKIE_NAME } from '../../auth/auth.controller';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly demoData: DemoDataService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: any }>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    try {
      const payload = this.jwt.verify(token);
      const user = this.demoData.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  private extractToken(request: Request) {
    if (request.cookies && request.cookies[COOKIE_NAME]) {
      return request.cookies[COOKIE_NAME];
    }
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
