import { InterfaceCommon } from 'liemdev-profile-lib';

export type IResponseLogin<T> = InterfaceCommon.IResponseLogin<T> & {
  customer?: T;
};
export type IGetMulti<T> = InterfaceCommon.IGetMulti<T>;
