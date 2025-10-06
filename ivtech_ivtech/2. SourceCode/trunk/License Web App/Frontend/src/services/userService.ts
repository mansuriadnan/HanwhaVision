import apiUrls from "../constants/apiUrls";
import User from "../interfaces/ICreateUser";
import { ApiResponse } from "../interfaces/IApiResponse";
import IChangePassword from "../interfaces/IChangePassword";
import IForgotPassword from "../interfaces/IForgotPassword";
import IOtpVerification from "../interfaces/IOtpVerification";
import IForgotPasswordReset from "../interfaces/IForgotPasswordReset";
import { IUsers } from "../interfaces/IGetAllUsers";
import { apiPostService } from "../utils/apiPostService";
import { apiGetService, apiGetServiceFullResponse } from "../utils/apiGetService";
import { apiDeleteService } from "../utils/apiDeleteService";


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
  apiGetServiceFullResponse({
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
    url:apiUrls.UserDelete,
    id:id
  });

export const GetUserPermissions = () => 
  apiGetServiceFullResponse({
    url: apiUrls.getUserPermission,
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
  
    export const sendOtpService = (data: IForgotPassword) =>
      apiPostService({
        url: apiUrls.SendOtp,
        data: data,
      });

