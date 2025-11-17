import { IOptionModelResponse } from "./IOptionModelResponse";

export interface IDataAccessPermission {
  siteIds: string[];
  floorIds: string[];
  zoneIds: string[];
}

export interface IUsers {
  username: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  password: string;
  roleIds: string[];
  //dataAccessPermission: IDataAccessPermission | null;
  id: string;
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
  profileImage?: string;
}

export interface IReferenceDatatype {
  roleIds?: IOptionModelResponse[];
  createdBy: IOptionModelResponse[];
  updatedBy: IOptionModelResponse[];
}

export interface IProfileReferenceData {
  roleIds: IOptionModelResponse[];
}
