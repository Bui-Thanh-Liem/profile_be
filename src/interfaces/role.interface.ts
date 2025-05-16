import { InterfaceCommon } from 'liemdev-profile-lib';
import { IRole, IRoleGroup } from './models.interface';

export type IRoleDataResource = InterfaceCommon.IRoleDataResource;
export type IRoleOnRoute = InterfaceCommon.IRoleOnRoute;

export interface IRoleCheck {
  isAdmin: boolean;
  roles: IRole[];
  roleGroups: IRoleGroup[];
}
