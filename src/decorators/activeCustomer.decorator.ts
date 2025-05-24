import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TPayloadToken } from 'src/types/TPayloadToken.type';

export const ActiveCustomer = createParamDecorator(
  (field: keyof TPayloadToken | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const customer: TPayloadToken | undefined = req['customer'];
    return field && customer ? customer[field] : customer;
  },
);
