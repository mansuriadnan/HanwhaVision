interface IChangePassword {
  userId?: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export default IChangePassword;
