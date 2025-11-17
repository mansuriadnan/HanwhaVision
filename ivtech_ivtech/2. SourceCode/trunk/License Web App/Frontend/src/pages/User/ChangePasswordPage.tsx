import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
} from "@mui/material";
import { ChangePasswordService } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CustomButton, CustomTextField } from "../../components";
import { REGEX } from "../../utils/constants";
import CommonDialog from "../../components/Reusable/CommonDialog";
import { useAuth } from "../../hooks/useAuth";

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const {handleLogout} = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordForm>();

  const newPassword = watch("newPassword");
  const [openSuccessConfirm, setOpenSuccessConfirm] = useState<boolean>(false);

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      const userProfile = localStorage.getItem("userProfile");
      const userId = userProfile ? JSON.parse(userProfile).id : "";
      const result = await ChangePasswordService({
        userId,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      if (typeof result !== "string") {
        //navigate("/");
        setOpenSuccessConfirm(true);
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleRedirectLogin = () => {
    setOpenSuccessConfirm(false);
    handleLogout();
    navigate("/");
  }

  return (
    <>
      <Box className="rightbar-main-content" >
        <Box className="pass-main">
          <Typography component="h1" variant="h5">
            Enter New Password
          </Typography>
          <Box
          className="comn-pop-up-design" 
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ mt: 3 }}
          >
            <CustomTextField
              name="oldPassword"
              control={control}
              label="Current Password"
              type={"password"}
              fullWidth
              rules={{
                required: "Current password is required",
              }}
              placeholder="Enter current password"
              required
            />
            <CustomTextField
              name="newPassword"
              control={control}
              label="New Password"
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
              required
            />
            <CustomTextField
              name="confirmPassword"
              control={control}
              label="Confirm Password"
              type={"password"}
              fullWidth
              rules={{
                required: "Confirm password is required",
                validate: (value) =>
                  value === newPassword ||
                  "New password and confirm password must match",
              }}
              placeholder="Enter confirm password"
              required
            />
            <CustomButton
              fullWidth={true}
              onClick={handleSubmit(onSubmit)}
              customStyles={{ mt: 3 }}
            >
              Update Password
            </CustomButton>
          </Box>
        </Box>
      </Box>
      <CommonDialog
        open={openSuccessConfirm}
        title="Password Successfully Changed!"
        content="Please login to your admin account again"
        onConfirm={() => handleRedirectLogin()}
        confirmText="Login Now"
        type="success"
        customClass="common-dialog-with-icon"
      />
    </>
  );
};

export { ChangePasswordPage };
