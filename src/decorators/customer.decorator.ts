import { SetMetadata } from '@nestjs/common';

export const Customer = () => SetMetadata('isCustomer', true);
