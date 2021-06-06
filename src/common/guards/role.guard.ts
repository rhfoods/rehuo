import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRoleTypes } from '../constants/system.constant';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<SystemRoleTypes>('role', context.getHandler());
    if (!role) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (user.rl !== role) {
      return false;
    }

    return true;
  }
}
