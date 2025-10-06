import { IOptionModelResponse } from "./IOptionModelResponse";


export interface User {
  id?: string;
  userName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface IChangePassword {
  userId?: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface IForgotPassword {
  email?: string;
}


export interface IForgotPasswordReset {
  otp: string | null;
  email: string | null;
  newPassword: string;
  confirmPassword?: string;
}


export interface IDataAccessPermission {
  siteIds: string[];
  floorIds: string[];
  zoneIds: string[];
}

export interface IUserPreferences {
  theme: "light" | "dark";
  isOsSyncTimeZone: boolean;
  timezoneId: string;
  isDaylightSavings: boolean;
  language: string;
}


export interface IUsers {
  username: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  password: string;
  roleIds: string[];
  dataAccessPermission: IDataAccessPermission | null;
  id: string;
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
  profileImage?: string;
  userPreferences?: IUserPreferences;
}

export interface IUserResetPassword {
  userId: string;
  newPassword: string;
  confirmPassword: string;
}


export interface IOtpVerification {
  otp?: string;
  email: string | null;
}

export interface IProfileReferenceData {
  roleIds: IOptionModelResponse[];
}
