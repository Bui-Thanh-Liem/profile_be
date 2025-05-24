import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TPayloadToken } from 'src/types/TPayloadToken.type';

export const ActiveUser = createParamDecorator((field: keyof TPayloadToken | undefined, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const user: TPayloadToken | undefined = req.user;
  return field && user ? user[field] : user;
});
