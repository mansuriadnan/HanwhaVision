import React, { useState } from "react";
import { Box, Container, Typography, IconButton } from "@mui/material";
import { useNavigate, Navigate } from "react-router-dom";
import { ForgotPasswordResetService } from "../../services/userService";
import { useForm } from "react-hook-form";
import { CustomTextField, CustomButton } from "../../components/index";
import { REGEX } from "../../utils/constants";
import CommonDialog from "../../components/Reusable/CommonDialog";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

// Reset Password Component
const ResetPassword: React.FC = () => {
  const [openSuccessDialog, setopenSuccessDialog] = useState(false);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const newPassword = watch("newPassword");

  // Check if email exists in sessionStorage
  const resetEmail = sessionStorage.getItem("resetEmail");
  // if (!resetEmail) return <Navigate to="/" />;

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      const result: any = await ForgotPasswordResetService({
        otp: sessionStorage.getItem("otp"),
        email: sessionStorage.getItem("resetEmail"),
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (result?.isSuccess === true) {
        setopenSuccessDialog(true);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }

    sessionStorage.removeItem("resetEmail");
    sessionStorage.removeItem("otp");
  };



  const handleLoginConfirm = () => {
    sessionStorage.removeItem("resetEmail");
    sessionStorage.removeItem("otp");
    navigate("/");
  };

  return (
    <Box className="login-main">
      <Box className="login-wrapper">
        <Box className="login-left">
          <Typography variant="h1">Welcome to</Typography>
          <span>LICENSE DASHBOARD</span>
          <img
            src="images/login.svg"
            alt="Logo"
            style={{ width: "80%", height: "auto" }}
          />
        </Box>
        <Box className='login-right '>
          <IconButton onClick={() => navigate("/forgotpassword")}>
            <img
              src={"/images/backArrow.svg"}
              alt="back to login"
            />
          </IconButton>
          <Typography
            variant="h5"
            fontWeight="bold"
            className="forgotPasswordtext"
          >
            Setup Password
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3 }}>
            Enter New Password
          </Typography>
          <Box sx={{ mt: 1 }} component="form">
            <CustomTextField
              name="newPassword"
              control={control}
              label="NEW PASSWORD"
              type={"password"}
              fullWidth
              rules={{
                required: "New password is required",
                pattern: {
                  value: REGEX.Password_Regex,
                  message: "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (excluding *)",
                },
              }}
              placeholder="Enter new password"
            />

            <CustomTextField
              name="confirmPassword"
              control={control}
              label="CONFIRM PASSWORD"
              type={"password"}
              fullWidth
              rules={{
                required: "Confirm password is required",
                validate: (value) =>
                  value === newPassword ||
                  "New password and confirm password must match",
              }}
              placeholder="Enter confirm password"
            />

            <CustomButton
              fullWidth={true}
              onClick={handleSubmit(onSubmit)}
              customStyles={{ mt: 3, mb: 2 }}
            >
              Update Password
            </CustomButton>
          </Box>
        </Box>
        <CommonDialog
          open={openSuccessDialog}
          title="Password changed Successfully"
          content="Your password has been successfully changed. You can now log in with your new password."
          onConfirm={handleLoginConfirm}
          confirmText="Login"
          type="passwordsuccess"
          customClass="common-dialog-with-icon"
        />
      </Box>
    </Box>
  );
};

export { ResetPassword };
