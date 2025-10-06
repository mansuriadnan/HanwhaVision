export interface ILicence {
  // clientId: string;
  customerId : string;
  //cameras: number;
  noOfCameras: number;
  // users: number;
  noOfUsers: number;
  status: string;
  startDate: string;
  expiryDate: string;
  id: string;
  createdOn: string;
  createdBy: string;
  updatedOn: string;
  updatedBy: string;
  isDeleted: boolean | null;
  licenseType: string;
  trialDurationDays: number;
  noOfChannel: number;
  macAddress: string ;
  siteName:string;
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

export interface IReferenceData {
  clientMapping: IReferenceItem[];
  clientMachineId: IReferenceItem[];
  createdBy: IReferenceItem[];
}

export interface IApiResponse {
  isSuccess: boolean;
  message: string;
  data: ILicence[];
  referenceData: IReferenceData;
  errors: null | string;
  statusCode: number;
}

export interface ITopLicenseDue {
  customerName: string;
  noCamera: number;
  noUser: number;
  expiredOn: Date;
}

export interface IResendLicensePayload{
  licenseId?: string;
}