import { iOptionModelResponse } from "./iOptionModelResponse";

export interface Idistributor {
  distributorName: string;
  address: string;
  email: string;
  countryId: string;
  //contactPersonName:string;
  contactPerson: string;
  id: string;
  createdOn: string; // ISO Date string
  createdBy: string;
  updatedOn: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedOn: string | null; // Can be null
}

export interface referenceDatatype {
  countryId: iOptionModelResponse[];
  createdBy:iOptionModelResponse[];
  updatedBy:iOptionModelResponse[];
}

export interface IAdddistributor {
  distributorName: string;
  address: string;
  email: string;
  countryId: string;
}


export interface IDistributorDelete{
  id: string
}
