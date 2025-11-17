import { Container, Box, Typography, Grid2 } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../components/Reusable/Toast";
import { CustomButton, CustomTextField } from "../../components/index";
import { SubmitHandler, useForm } from "react-hook-form";
import { LABELS, REGEX, SIDEBAR_TITLES } from "../../utils/constants";
import { usePermissions } from "../../context/PermissionsContext";
import { useEffect, useState } from "react";
import CommonDialog from "../../components/Reusable/CommonDialog";

const LoginPage = () => {
  const navigate = useNavigate();
  const { handleLogin, error, handleLogout } = useAuth();
  const { setPermissions } = usePermissions();
  const [isPermissionModelOpen, setIsPermissionModelOpen] = useState<boolean>(false);
  // const [parsedPermissions, setParsedPermissions] = useState<any[]>([]);

  // useEffect(() => {
  //   const permissions = localStorage.getItem("permissions");
  //   setParsedPermissions(permissions ? JSON.parse(permissions) : []);
  // }, []);

  interface LoginFormInputs {
    userName: string;
    password: string;
  }

  const { control, handleSubmit } = useForm<LoginFormInputs>({
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const handleClosePermissionModal = () => {
    handleLogout();
    setIsPermissionModelOpen(false);
  }

  const login: SubmitHandler<LoginFormInputs> = async (data) => {

    try {
      const { success, errorMessage, permissions} = await handleLogin(
        data.userName,
        data.password
      );
      if (success) {
        if (Array.isArray(permissions) && permissions.length > 0) {
          navigate("/welcome", {
            state: {
              label: LABELS.Customer_License_Master,
              screenName: SIDEBAR_TITLES.WelcomePage,
            },
          });
        } else {
          setIsPermissionModelOpen(true);
        }
      } else {
        showToast(errorMessage || "An unknown error occurred.", "error");
      }
    } catch (error) { }
  };

  return (
    <Box className="login-main">
      <Box className="login-wrapper">
        <Box className="login-left">
          <Typography variant="h1">Welcome to</Typography>
          <span>LICENSE DASHBOARD</span>
          <div className="login-client-logo"><img src="images/login.svg" alt="Logo" /></div>
        </Box>

        <Box className="login-right">
          <Typography variant="h5">Continue To Your Admin Account</Typography>
          <Box sx={{ mt: 1 }} component="form">
            <CustomTextField
              name="userName"
              label="EMAIL/USER NAME"
              control={control}
              rules={{
                required: "Username or Email is required.",
                validate: (value) => {
                  if (REGEX.UserName_Regex.test(value) || REGEX.Email_Regex.test(value)) {
                    return true;
                  }
                  return "Enter a valid username or email.";
                },
              }}
              fullWidth
              autoFocus
              placeholder="Enter username or email"
            />

            <CustomTextField
              name="password"
              label="PASSWORD"
              control={control}
              rules={{
                required: "Password is required.",
              }}
              type="password"
              fullWidth
              autoFocus
              placeholder="Enter password"
            />

            <CustomButton
              onClick={handleSubmit(login)}
              fullWidth
              customStyles={{ mt: 3, mb: 2 }}
            >
              Login
            </CustomButton>

            <Grid2 container justifyContent={"center"}>
              <Box>
                <Link to="/forgotpassword">Forgot Password</Link>
              </Box>
            </Grid2>
          </Box>
        </Box>
      </Box>
      <CommonDialog
        open={isPermissionModelOpen}
        title=""
        content="You have not been assigned any permissions to access the application. Please contact your administrator for more information."
        onConfirm={handleClosePermissionModal}
        confirmText="Okay"
        customClass="common-dialog-with-icon"
      />
    </Box>
  );
};

export { LoginPage };
