interface IForgotPassword {
  email?: string;
  isResent?: boolean;
  isFromUser?: boolean;
  id?: string;
  newEmailId?: string;
}

export default IForgotPassword;
