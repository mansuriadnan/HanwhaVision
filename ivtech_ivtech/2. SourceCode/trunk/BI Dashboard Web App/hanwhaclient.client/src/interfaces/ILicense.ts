export interface ILicenseData {
  cameras: number;
  clientId: string;
  createdBy: string | null;
  createdOn: string;
  deletedOn: string | null;
  expiryDate: string;
  id: string;
  isDeleted: boolean;
  status: string | null;
  updatedBy: string;
  updatedOn: string;
  users: number;
  utilizedCamera: number;
  utilizedUser: number;
  licenseType: string;
  startDate: string;
}

export interface ILicenseReferenceData {
  cameraCount: number;
}

export interface ILicenseDetailFullResponse {
  isSuccess: boolean;
  message: string;
  data: ILicenseData;
  referenceData: ILicenseReferenceData;
  errors: string | null;
  statusCode: number;
}

export interface ILicenseHistory {
  companyName: string | null;
  siteName: string | null;
  // licenseType: "trail" | string;
  licenseType: string;
  startDate: string;
  expiryDate: string;
  macAddress: string | null;
  numberOfUsers: number;
  noOfChannel: number;
  id: string;
  createdOn: string;
  createdBy: string;
  updatedOn: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedOn: string | null;
}

export interface IReferenceItem {
  value: string;
  label: string;
  readOnly: boolean;
  isDisabled: boolean;
  isDefault: boolean;
  parentValue: string | null;
  type: string;
  order: number | null;
  hoverText: string;
  additionalProperty: string;
}

export interface ILicenseHistoryReferenceData {
  createdBy: IReferenceItem[]; 
}
