import { InterfaceModel } from 'liemdev-profile-lib';

export type IBase = InterfaceModel.IBase;
export type IRole = InterfaceModel.IRole;
export type IRoleGroup = InterfaceModel.IRoleGroup;
export type IToken = InterfaceModel.IToken;
export type IUser = InterfaceModel.IUser;
export type ISkill = InterfaceModel.ISkill;
export type IImage = InterfaceModel.IImage;
export type IImageStorage = InterfaceModel.IImageStorage;
export type IKeyWord = InterfaceModel.IKeyWord;
export type ISendMail = InterfaceModel.ISendMail;
export type ISubjectGroup = InterfaceModel.ISubjectGroup;
export type ISubjectItem = InterfaceModel.ISubjectItem;
export type IAbout = InterfaceModel.IAbout;
export interface ICustomer extends IBase {
  fullName: string;
  avatar: string | null;
  email: string;
  password?: string;
  phone?: string | null;
  tokens: IToken[] | string[];
  block: boolean;
  status: boolean;

  // from google
  accessToken: string;
  refreshToken: string;
}
