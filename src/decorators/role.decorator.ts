import { SetMetadata } from '@nestjs/common';
import { CONSTANT_DECORATOR } from 'src/constants';
import { IRoleOnRoute } from 'src/interfaces/role.interface';

export const Roles = (role: IRoleOnRoute) => SetMetadata(CONSTANT_DECORATOR.KEY_ROLES, role);
