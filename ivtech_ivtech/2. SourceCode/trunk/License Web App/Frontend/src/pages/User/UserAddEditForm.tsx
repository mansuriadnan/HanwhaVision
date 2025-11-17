import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Grid, Typography, TextField } from "@mui/material";
import {
  AddUserService,
  OtpVerificationService,
  sendOtpService,
  UpdateUserService,
} from "../../services/userService";
import { IUsers } from "../../interfaces/IGetAllUsers";
import { GetAllRoleService } from "../../services/roleService";
import { IRole } from "../../interfaces/IRole";
import { ILookup } from "../../interfaces/ILookup";
import { LABELS, REGEX } from "../../utils/constants";
import {
  CustomButton,
  CustomTextField,
  CustomMultiSelect,
} from "../../components/index";
import { SubmitHandler, useForm } from "react-hook-form";
import CommonDialog from "../../components/Reusable/CommonDialog";
import { ApiResponse } from "../../interfaces/IApiResponse";

interface UserAddEditFormProps {
  onClose: () => void;
  user?: any;
  refreshData: () => void;
}

interface UserFormInputs {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  roleIds: string[];
  password: string;
  confirmPassword: string;
}

interface OTPDialogForm {
  //email: string;
  // otp0: string;
  // otp1: string;
  // otp2: string;
  // otp3: string;
  // otp4: string;
  // otp5: string;
}

const UserAddEditForm: React.FC<UserAddEditFormProps> = ({
  onClose,
  user,
  refreshData,
}) => {
  const isEditMode = user !== null && user !== undefined;
  const [Rolelist, setRolelist] = useState<ILookup[]>([]);
  const [previousEmailID, setPreviousEmailID] = useState<string>("");
  const [openOTPDialog, setOpenOTPDialog] = useState<boolean>(false);
  const [updatedUserData, setUpdatedUserData] = useState<IUsers>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const REACT_APP_TIMEOUT = process.env.REACT_APP_TIMEOUT as string;
  const otpTimeOut =  Number.parseInt(REACT_APP_TIMEOUT);
  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      roleIds: [],
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    const initializeData = async () => {
      try {
        const response = await GetAllRoleService();
        const temprolelist = response.data as IRole[];
        const roleData = temprolelist?.map((item) => ({
          title: item.roleName,
          id: item.id,
        }));
        setRolelist(roleData as ILookup[]);
        if (isEditMode) {
          const initialUser = user;
          setValue("firstName", initialUser?.firstname || "");
          setValue("lastName", initialUser?.lastname || "");
          setValue("userName", initialUser?.username || "");
          setValue("email", initialUser?.email || "");
          setValue(
            "roleIds",
            Array.isArray(initialUser.roleIds) ? initialUser.roleIds : []
          );
          setValue("password", initialUser?.password || "");
          setValue("confirmPassword", initialUser?.password || "");
          setPreviousEmailID(initialUser?.email || "");
        } else {
          setPreviousEmailID(""); // Set empty string when not in edit mode
        }
      } catch (err) {
        console.error(err);
      }
    };

    initializeData();
  }, [isEditMode, user]);

  const Updateuser = async (
    userData: Omit<IUsers, "createdDateTime" | "lastUpdatedDateTime">
  ) => {
    try {
      const data: any = await UpdateUserService(userData);
      if (data?.isSuccess) {
        onClose();
        refreshData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // const handleUpdateUser: SubmitHandler<UserFormInputs> = async(data) => {
  //   const userData: Omit<IUsers, "createdDateTime" | "lastUpdatedDateTime"> = {
  //     firstname: data.firstName,
  //     lastname: data.lastName,
  //     username: data.userName,
  //     email: data.email,
  //     roleIds: data.roleIds,
  //     password: data.password,
  //     ...(isEditMode && user?.id && { id: user.id }),
  //   };
  //   Updateuser(userData);
  // }

  const handleAddUser: SubmitHandler<UserFormInputs> = (data) => {
    const userData: Omit<IUsers, "createdDateTime" | "lastUpdatedDateTime"> = {
      firstname: data.firstName,
      lastname: data.lastName,
      username: data.userName,
      email: data.email,
      roleIds: data.roleIds,
      password: data.password,
      ...(isEditMode && user?.id && { id: user.id }),
    };

    if (isEditMode) {
      if (data.email === previousEmailID) {
        Updateuser(userData);
      } else {
        // If email is different, show OTP dialog
        onsendOTP(user?.id || "", data.email);
        setOpenOTPDialog(true);
        setUpdatedUserData(userData);
      }
    } else {
      const Adduser = async () => {
        try {
          const data: any = await AddUserService(userData);
          if (data?.isSuccess) {
            onClose();
            refreshData();
          }
        } catch (err: any) {
          console.error(err);
        }
      };
      Adduser();
    }
  };

  //const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(otpTimeOut);
  const [canResend, setCanResend] = useState(false);

  const {
    control: otpControl,
    handleSubmit: handleOTPSumbit,
    reset,
    formState: { errors: otpErrors },
  } = useForm<OTPDialogForm>({
    defaultValues: {
      //email: "",
      // otp0: "",
      // otp1: "",
      // otp2: "",
      // otp3: "",
      // otp4: "",
      // otp5: "",
    },
  });

  useEffect(() => {
    if (openOTPDialog && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, openOTPDialog]);

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const handleResendOTP = async (data) => {
    try {
      try {
        const payload = {
          id: user?.id || "",
          isFromUser: true,
          isResent: true,
          newEmailId: data.email ?? "",
        };
        const result = await sendOtpService(payload);
      } catch (error) {
        console.error("Error resetting password:", error);
      }

      // Reset timer and disable resend button
      setTimeLeft(otpTimeOut);
      setCanResend(false);
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    // debugger;
    // const { ...otpData } = data;
    // const enteredOTP = Object.values(otpData).join("");

    // if (enteredOTP.length < 6) {
    //   //setError("Please enter complete OTP");
    //   return;
    // }

    e.preventDefault();
    // Check if OTP is complete
    if (otp.some((digit) => digit === "")) {
      setError("Please enter complete OTP");
      return;
    }
    // Simulated OTP validation
    const enteredOTP = otp.join("");

    try {
      const result: any = await OtpVerificationService({
        email: previousEmailID,
        otp: enteredOTP,
        isFromUser: true,
      });
      if (typeof result !== "string") {
        // sessionStorage.setItem("otp", enteredOTP);
        // sessionStorage.setItem("resetEmail", email);
        // navigate("/forgot-reset-password");
      }
      if (result.isSuccess) {
        setOpenOTPDialog(false);
        Updateuser(updatedUserData as IUsers);
        //handleSubmit(handleUpdateUser);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      reset();
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(
          `otp-${index + 1}`
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      !/^[0-9]$/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Tab"
    ) {
      event.preventDefault(); // Blocks non-numeric input
    }

    // Handle Backspace to move focus to previous input
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const onsendOTP = async (id: string, newEmailId: string) => {
    try {
      const data = {
        id: id,
        newEmailId: newEmailId,
      };
      const result = await sendOtpService(data);
      if (typeof result !== "string") {
        setTimeLeft(otpTimeOut);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleCloseOTPDialog = () => {
    setOpenOTPDialog(false);
    onClose();
    refreshData();
  };

  function OTPDialogContent(previousEmailID: string, id: string) {
    return (
      <Box component="form" className="forget-pass-form">
        <Typography mt={"3rem"} mb={"3rem"}>
          It looks like you've updated your email address. To proceed with
          saving your changes, an OTP verification is required.
        </Typography>
        {/* {[0, 1, 2, 3, 4, 5].map((digit, index) => (
          <CustomTextField
            key={index}
            name={
              `otp${index}` as
              | "otp0"
              | "otp1"
              | "otp2"
              | "otp3"
              | "otp4"
              | "otp5"
            }
            control={otpControl}
            placeholder="_"
            variant="outlined"
            sx={{ width: "22%", mr: 2 }}
            inputProps={{
              maxLength: 1,
              style: { textAlign: "center" },
            }}
            onKeyDown={(e) => {
              if (
                !/^[0-9]$/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Tab"
              ) {
                e.preventDefault(); // Blocks non-numeric input
              }
            }}
          ></CustomTextField>
        ))} */}

        {otp.map((digit, index) => (
          <TextField
            key={index}
            id={`otp-${index}`}
            variant="outlined"
            placeholder="_"
            type="text"
            inputProps={{
              maxLength: 1,
              style: { textAlign: "center" },
            }}
            value={digit}
            onChange={(e) => handleOTPChange(index, e.target.value)}
            sx={{ width: "20%" }}
            onKeyDown={(e) => handleKeyDown(index, e as any)}
          />
        ))}
        {/* {error && <Alert severity="error">{error}</Alert>} */}

        <Box className="reset-otp">
          <Typography variant="body2" color="text.secondary">
            {formatTimeLeft()}
          </Typography>

          <CustomButton
            variant="text"
            color="warning"
            onClick={handleOTPSumbit(handleResendOTP)}
            disabled={!canResend}
            customStyles={{
              fontWeight: "bold",
              textTransform: "none",
              background: "white",
            }}
          >
            Resend OTP
          </CustomButton>
        </Box>
        <Box className="otp-buuttons">
          <CustomButton
            className="cmn-cancel-btn"
            onClick={handleOTPSumbit(handleCloseOTPDialog)}
          >
            Cancel
          </CustomButton>
          <CustomButton onClick={handleVerifyOTP}>Submit</CustomButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="comn-pop-up-design"
      component="form"
      onSubmit={handleSubmit(handleAddUser)}
      noValidate
    >
      <Grid className="main-row-wrapper">
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="firstName"
            label="First Name"
            control={control}
            rules={{
              required: "First name is required.",
              pattern: {
                value: REGEX.Name_Regex,
                message: "Enter a valid first name",
              },
            }}
            placeholder="Enter first name"
            required
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            name="lastName"
            label="Last Name"
            control={control}
            rules={{
              required: "Last name is required.",
              pattern: {
                value: REGEX.Name_Regex,
                message: "Enter a valid last name",
              },
            }}
            placeholder="Enter last name"
            required
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            name="userName"
            label="Username"
            control={control}
            rules={{
              required: "Username is required.",
              pattern: {
                value: REGEX.UserName_Regex,
                message: "Enter a valid username",
              },
            }}
            placeholder="Enter username"
            required
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            name="email"
            label="Email Address"
            control={control}
            rules={{
              required: "Email address is required",
              pattern: {
                value: REGEX.Email_Regex,
                message: "Enter a valid email address",
              },
            }}
            placeholder="Enter email address"
            required
            fullWidth
          />
        </Grid>

        {!isEditMode && (
          <>
            <Grid container item xs={12} md={12}>
              <CustomTextField
                name="password"
                label="Password"
                control={control}
                type={"password"}
                rules={{
                  required: "Password is required",
                  pattern: {
                    value: REGEX.Password_Regex,
                    message:
                      "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (excluding *)",
                  },
                }}
                placeholder="Enter password"
                required
                fullWidth
                disabled={isEditMode}
              />
            </Grid>

            <Grid container item xs={12} md={12}>
              <CustomTextField
                name="confirmPassword"
                label="Confirm Password"
                control={control}
                type={"password"}
                rules={{
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === password ||
                    "Password and confirm password must match",
                }}
                placeholder="Enter confirm password"
                required
                fullWidth
                disabled={isEditMode}
              />
            </Grid>
          </>
        )}

        <Grid container item xs={12}>
          <CustomMultiSelect
            name="roleIds"
            control={control}
            // label="Roles*"
            label={
              <label>
                Roles<span>*</span>
              </label>
            }
            options={Rolelist}
            rules={{ required: "At least one role must be selected" }}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12} container>
          <CustomButton fullWidth className="pop-bottom-cmn-btn">
            {isEditMode ? "Update User" : "Add User"}
          </CustomButton>
        </Grid>
      </Grid>

      <CommonDialog
        open={openOTPDialog}
        title={"Enter OTP"}
        customClass="enter-otp-inner"
        content={OTPDialogContent(previousEmailID, user?.id || "")}
        onCancel={handleCloseOTPDialog}
        // confirmText="Confirm"
        // cancelText="Cancel"
        // onConfirm={() => {}}
      />
    </Box>
  );
};

export { UserAddEditForm };
