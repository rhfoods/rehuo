import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtTypes } from '../constants/system.constant';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const type = this.reflector.get<JwtTypes>('token', context.getHandler());
    if (!type) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (user.tk !== type) {
      return false;
    }

    return true;
  }
}
