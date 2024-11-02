import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// get user from               context.args[0].user = user;
export const GetConversation = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.conversation;
  },
);
