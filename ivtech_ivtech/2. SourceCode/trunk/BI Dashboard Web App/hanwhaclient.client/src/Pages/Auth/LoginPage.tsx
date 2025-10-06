import { useEffect, useState } from "react";
import {
  Container,
  CssBaseline,
  Box,
  Typography,
  Grid2,
  Grid,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ValidateLicenseService } from "../../services/licenseService";
import { useLicense } from "../../context/LicenseContext";
import { SubmitHandler, useForm } from "react-hook-form";
import { useThemeContext } from "../../context/ThemeContext";
import { GetClientSettingsData } from "../../services/settingService";
import { useSettingsContext } from "../../context/SettingContext";
import { REGEX } from "../../utils/constants";
import { CommonDialog } from "../../components/Reusable/CommonDialog";
import { CustomButton } from "../../components/Reusable/CustomButton";
import { CustomTextField } from "../../components/Reusable/CustomTextField";
import { showToast } from "../../components/Reusable/Toast";


interface LoginFormInputs {
  userName: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { handleLogin, error, handleLogout } = useAuth();
  //const { setIsLicenseValid } = useLicense();
  const { saveSettings } = useSettingsContext();
  const [isForgotPasswordDialogOpen, setForgotPasswordDialogOpen] =
    useState<boolean>(false);
  const [isPermissionModelOpen, setIsPermissionModelOpen] =
    useState<boolean>(false);
  const { control, handleSubmit } = useForm<LoginFormInputs>({
    defaultValues: {
      userName: "",
      password: "",
    },
  });
  const location = useLocation();
 const { setTheme } = useThemeContext();

useEffect(() => {
  
  if (location.pathname === "/login" || location.pathname === "/") {
    localStorage.clear();   // remove only theme
    document.body.classList.remove("dark"); // force remove if needed
    document.body.classList.add("light");
    setTheme("light")

  }
}, []);


  const login: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const { success, errorMessage, permissions } = await handleLogin(
        data.userName,
        data.password
      );
      if (success) {
        fetchClientSettings();
        const validateLicenseResponse = await ValidateLicenseService();
        if (Array.isArray(permissions) && permissions.length > 0) {
          // setIsLicenseValid(validateLicenseResponse);
          //  navigate("/general-settings")
          navigate("/welcome");
        } else {
          setIsPermissionModelOpen(true);
        }
      } else {
        showToast(errorMessage || "An unknown error occurred.", "error");
      }
    } catch (error) { }
  };

  const fetchClientSettings = async () => {
    try {
      const response: any = await GetClientSettingsData();
      if (response != undefined) {
        saveSettings(response);
      }
    } catch (err) {
      console.error("Error fetching client settings", err);
    }
  };

  const handleClosePermissionModal = () => {
    handleLogout();
    setIsPermissionModelOpen(false);
  };

  const forgotPasswordContent = (
    <>
      <h1>Forget password is restricted</h1>
      <h4>Kindly coordinate with your administrator to reset the password.</h4>
    </>
  );

  return (
    <Box className="login-main">
      <Box className="container">
        <Grid className="login-wrapper">
          {/* left side */}
          <Grid className="login-left">
            <img src={"images/vision_insight_logo.svg"} alt="Logo" />
            <Typography variant="h4" fontWeight={600} sx={{ marginTop: 10 }}>
              Maximize safety,efficiency and insights
            </Typography>
            <Typography variant="body1">
              Real-time dashboard analytics for insights
            </Typography>
            <Typography variant="body1">
              on safety and business
              intelligence
            </Typography>
          </Grid>

          {/* Right Side - Login Form */}

          <Grid className="login-right">
            <CssBaseline />
            <Box className="login-form">
              {/* <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
                  <LockOutlined />
                </Avatar> */}
              <Typography variant="h5">Login</Typography>
              <Typography
                variant="body2"
                sx={{ marginTop: 1, marginBottom: "20px" }}
              >
                Enter your account details
              </Typography>
              <form onSubmit={handleSubmit(login)}>
                <CustomTextField
                  name="userName"
                  label="Username/Email"
                  type="text"
                  control={control}
                  rules={{
                    required: "Username or Email is required",
                    validate: (value: any) => {
                      if (REGEX.UserName_Regex.test(value) || REGEX.Email_Regex.test(value)) {
                        return true;
                      }
                      return "Enter a valid username or email.";
                    },
                  }}
                  fullWidth
                  autoFocus
                  // required
                  customStyles={{
                    marginBottom: "16px", // Add spacing
                  }}
                  placeholder="Enter username or email address"
                />

                <CustomTextField
                  name="password"
                  label="Password"
                  control={control}
                  rules={{
                    required: "Password is required.",
                  }}
                  type="password"
                  fullWidth
                  // required
                  customStyles={{
                    marginBottom: "16px",
                  }}
                  placeholder="Enter password"
                />

                <CustomButton
                  type="submit"
                  fullWidth
                  customStyles={{ mt: 3, mb: 2 }}
                  className="common-btn-design"
                >
                  Login
                </CustomButton>
                <Grid2 container justifyContent={"center"}>
                  <Box>
                    <Link
                      to="#"
                      onClick={() => setForgotPasswordDialogOpen(true)}
                      style={{ cursor: "pointer", textDecoration: "none" }}
                    >
                      Forgot Password
                    </Link>
                  </Box>
                </Grid2>
              </form>
            </Box>
          </Grid>

          <CommonDialog
            open={isForgotPasswordDialogOpen}
            title={""}
            content={
              <div>
                <h2>Forget password are restricted</h2>
                <p>
                  Kindly coordinate with your administrator to reset the
                  password.
                </p>
              </div>
            }
            confirmText="Okay"
            onCancel={() => setForgotPasswordDialogOpen(false)}
            onConfirm={() => setForgotPasswordDialogOpen(false)}
            type="contactAdministrator"
            customClass="forgot-pass"
            titleClass={true}
          />
        </Grid>
      </Box>
      <CommonDialog
        open={isPermissionModelOpen}
        title=""
        content="You have not been assigned any permissions to access the application. Please contact your administrator for more information."
        onConfirm={handleClosePermissionModal}
        confirmText="Okay"
        customClass="common-dialog-with-icon"
        titleClass={true}
      />
    </Box>
  );
};
export default LoginPage;
