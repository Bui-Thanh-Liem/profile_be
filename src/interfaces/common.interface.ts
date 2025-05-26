import { InterfaceCommon } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { TPayloadToken } from 'src/types/TPayloadToken.type';

export type IStackTrace = InterfaceCommon.IStackTrace;

export interface IResultUploadGGDrive {
  fileId: string;
  viewUrl: string;
  downloadUrl: string;
}

export interface ICreateService<Dto> {
  payload: Dto;
  active: TPayloadToken;
}

export interface IUpdateService<Dto> {
  id: string;
  payload: Dto;
  newImage?: Express.Multer.File;
  newImages?: Express.Multer.File[];
  active: TPayloadToken;
}

export interface IFindAllService<Entity> {
  queries: AQueries<Entity>;
  active?: TPayloadToken;
}

export type ISendMail = InterfaceCommon.ISendMail;
export type ISendSms = InterfaceCommon.ISendSms;
