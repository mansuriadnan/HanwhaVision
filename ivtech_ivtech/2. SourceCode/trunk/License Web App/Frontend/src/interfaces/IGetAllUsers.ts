import { IRoleUser } from "./IRoleUser";
import { iOptionModelResponse } from "./iOptionModelResponse";

// export interface IUsers {
//   id: string;
//   firstName: string;
//   lastName: string;
//   userName: string;
//   email: string;
//   roles: IRoleUser[]; // Changed from roleName to roles array
//   createdDateTime: string;
//   lastUpdatedDateTime: string;
// }
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

export interface referenceDatatype {
  roleIds: iOptionModelResponse[];
  createdBy: iOptionModelResponse[];
  updatedBy: iOptionModelResponse[];
}

export interface IProfileReferenceData {
  roleIds: iOptionModelResponse[];
}
