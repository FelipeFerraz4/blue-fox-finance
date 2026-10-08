import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { KeycloakUser } from './jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user }: { user: KeycloakUser } = context
      .switchToHttp()
      .getRequest();

    if (!user || !user.roles) {
      return false;
    }

    // Suporta qualquer match entre as roles do usuário e as roles requeridas
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
