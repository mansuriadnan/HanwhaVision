import apiUrls from "../constants/apiUrls";
import {
  User,
  IChangePassword,
  IForgotPassword,
  IForgotPasswordReset,
  IUserResetPassword,
  IOtpVerification,
} from "../interfaces/IUser";
import { ApiResponse } from "../interfaces/IApiResponse";
import { apiPostService } from "../utils/apiPostService";
import {
  apiGetService,
  apiGetServiceFullResponse,
} from "../utils/apiGetService";
import { apiDeleteService } from "../utils/apiDeleteService";
import { IUsers } from "../interfaces/IManageUsers";
import { PreferencesForm } from "../interfaces/IUserPreferences";

export const createUser = (user: User) =>
  apiPostService<User>({
    url: apiUrls.CreateUser,
    data: user,
  });

export const ChangePasswordService = (user: IChangePassword) =>
  apiPostService<IChangePassword>({
    url: apiUrls.ChangePassword,
    data: user,
  });

export const ForgotPasswordService = (user: IForgotPassword) =>
  apiPostService<IForgotPassword>({
    url: apiUrls.ForgotPassword,
    data: user,
  });

export const OtpVerificationService = (otpVerification: IOtpVerification) =>
  apiPostService<IOtpVerification>({
    url: apiUrls.ValidateOtp,
    data: otpVerification,
  });

export const ForgotPasswordResetService = (user: IForgotPasswordReset) =>
  apiPostService<IForgotPasswordReset>({
    url: apiUrls.ForgotResetPassword,
    data: user,
  });

export const GetAllUsersService = () =>
  apiGetServiceFullResponse<IUsers[]>({
    url: apiUrls.GetAllUser,
  });

export const UpdateUserService = (
  users: Omit<IUsers, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<IUsers, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.UpdateUser,
    data: users,
  });

export const AddUserService = (
  users: Omit<IUsers, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<IUsers, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.UpdateUser,
    data: users,
  });

export const DeleteUserService = (id: string) =>
  apiDeleteService({
    url: apiUrls.UserDelete,
    id: id,
  });

export const GetUserPermissions = () =>
  apiGetServiceFullResponse({
    url: apiUrls.getUserPermission,
  });

export const UserResetPassword = (payload: IUserResetPassword) =>
  apiPostService<IUserResetPassword>({
    url: apiUrls.UserResetPassword,
    data: payload,
  });

export const GetUserProfileDetails = () =>
  apiGetServiceFullResponse({
    url: apiUrls.GetUserProfile,
  });

export const uploadUserProfileImageService = (formData: FormData) =>
  apiPostService<FormData>({
    url: apiUrls.UploadProfileImage,
    data: formData,
    isFormData: true,
  });
export const SaveUserPreferences = (payload: any) =>
  apiPostService({
    url: apiUrls.SaveUserPreferences,
    data: payload,
  });
