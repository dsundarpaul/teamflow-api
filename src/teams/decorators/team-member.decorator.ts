import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TeamMemberInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.teamMember;
  },
);

