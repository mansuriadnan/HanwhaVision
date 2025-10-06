import { iOptionModelResponse } from "./iOptionModelResponse";

export interface IRole {
  id: string;
  roleName: string;
  description: string; 
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
}


export interface referenceDatatype {
  createdBy:iOptionModelResponse[];
  updatedBy:iOptionModelResponse[];
}