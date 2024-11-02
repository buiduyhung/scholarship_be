import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

// get user from               context.args[0].user = user;
export const UserWS = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
