interface IForgotPasswordReset {
  otp: string | null;
  email: string | null;
  newPassword: string;
  confirmPassword?: string;
}

export default IForgotPasswordReset;
