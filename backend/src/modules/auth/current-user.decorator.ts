import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { KeycloakUser } from './jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof KeycloakUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: KeycloakUser = request.user;
    return data ? user?.[data] : user;
  },
);
