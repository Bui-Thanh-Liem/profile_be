import { InterfaceCommon, Enums } from 'liemdev-profile-lib';

export type IRoleDataResource = InterfaceCommon.IRoleDataResource;

export interface IRoleDataResourceRequire {
  resource: Enums.ERoleResources;
  action: Enums.ERoleActions;
}
