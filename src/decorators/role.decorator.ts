import { SetMetadata } from '@nestjs/common';
import { IRoleDataResourceRequire } from 'src/interfaces/role.interface';

export const Roles = (role: IRoleDataResourceRequire) => SetMetadata('roles', role);
