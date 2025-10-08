import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppUser } from '../../demo/models';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AppUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AppUser }>();
    return request.user;
  },
);
