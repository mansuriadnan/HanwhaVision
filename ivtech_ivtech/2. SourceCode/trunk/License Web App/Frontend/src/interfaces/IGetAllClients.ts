import { iOptionModelResponse } from "./iOptionModelResponse";
export interface IClient {
  id?: string;
  customerName: string;
  distributorId?: string;
  contactPersonName: string;
  contactPersonMobile: string;
  officePhone: string;
  emailAddress: string;
  countryId?: string | null;
  stateId?: string | null;
  cityId?: string | null;
  postalCode: string;
  address: string;
  publicKeyPem?: string;
  privateKeyPem?: string;
  macAddress?: string;
  customerNo?: string | null;
  createdOn?: string | null;
  createdBy?: string | null;
  updatedOn?: string | null;
  updatedBy?: string | null;
}

export interface IDashBoardOverview {
  activeLicenses: number;
  expiredLicenses: number;
  futureLicenses: number;
  totalActiveCustomer: number;
  totalActiveLicenses: number;
  totalActiveUsers: number;
  totalCustomer: number;
  totalGeneratedLicenses: number;
  totalUsers: number;
}

export interface referenceDatatype {
  distributorId: iOptionModelResponse[];
  createdBy: iOptionModelResponse[];
  updatedBy: iOptionModelResponse[];
  distributorIdEmail:iOptionModelResponse[];
}
