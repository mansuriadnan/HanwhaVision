import React, { useState, useEffect } from "react";
import { Box, Container, Typography, IconButton, Alert, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ForgotPasswordService,
  OtpVerificationService,
} from "../../services/userService";
import { useForm } from "react-hook-form";
import {
  CustomTextField,
  CustomButton,
} from "../../components/index";
import { REGEX } from "../../utils/constants";

interface ForgotPasswordOTPForm {
  email: string;
  // otp0: string;
  // otp1: string;
  // otp2: string;
  // otp3: string;
  // otp4: string;
  // otp5: string;
}

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const REACT_APP_TIMEOUT = process.env.REACT_APP_TIMEOUT as string;
  const otpTimeOut =  Number.parseInt(REACT_APP_TIMEOUT);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtp, setshowOtp] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(otpTimeOut);
  const [canResend, setCanResend] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordOTPForm>({
    defaultValues: {
      email: "",
      // otp0: "",
      // otp1: "",
      // otp2: "",
      // otp3: "",
      // otp4: "",
      // otp5: "",
    },
  });

  useEffect(() => {
      if (showOtp && timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        setCanResend(true);
      }
    }, [timeLeft, showOtp]);

  useEffect(() => {
    if (!showOtp) {
      reset();
    }
  }, [showOtp, reset]);

  const onsendOTP = async (data) => {
    try {
      const result = await ForgotPasswordService({ email: data.email });
      if (typeof result !== "string") {
        sessionStorage.setItem("resetEmail", data.email);
        setshowOtp(true);
        setTimeLeft(otpTimeOut);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""
      }${seconds}`;
  };

  const handleResendOTP = async (data) => {
    try {
      try {
        const result = await ForgotPasswordService({
          email: data.email,
          isResent: true,
        });

        if (typeof result !== "string") {
          sessionStorage.setItem("resetEmail", data.email);
        }
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
    // const { email, ...otpData } = data;
    // const enteredOTP = Object.values(otpData).join("");

    // if (enteredOTP.length < 6) {
    //   setError("Please enter complete OTP");
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
    const email = sessionStorage.getItem("resetEmail") || "";
    try {
      const result = await OtpVerificationService({
        email: email,
        otp: enteredOTP,
      });
      if (typeof result !== "string") {
        sessionStorage.setItem("otp", enteredOTP);
        sessionStorage.setItem("resetEmail", email);
        navigate("/forgot-reset-password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
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

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/^[0-9]$/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Tab"
    ) {
      event.preventDefault(); // Blocks non-numeric input
    }

    // Handle Backspace to move focus to previous input
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
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
        <Box className="login-right login-right-inner">
          <IconButton
            onClick={() => {
              if (showOtp) {
                setshowOtp(false);
                reset();
              } else {
                navigate("/");
              }
            }}
          >
            <img
              src={"/images/backArrow.svg"}
              alt="back to login"
              width="24"
              height="24"
            />
          </IconButton>
          <Typography
            variant="h5"
            fontWeight="bold"
            className="forgotPasswordtext"
          >
            Forgot Password
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3 }}>
            Please enter the Email Used during sign-up.
          </Typography>
          <Box sx={{ mt: 1 }} component="form">
            <CustomTextField
              name="email"
              control={control}
              label="EMAIL"
              type="email"
              fullWidth
              placeholder="Enter registered email address"
              rules={{
                required: "Email is required",
                pattern: {
                  value: REGEX.Email_Regex,
                  message: "Please enter a valid email address",
                },
              }}
              customStyles={{ marginBottom: 16 }}
              disabled={showOtp}
            />

            {!showOtp ? (
              <CustomButton
                fullWidth
                variant="text"
                color="warning"
                onClick={handleSubmit(onsendOTP)}
                customStyles={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  textTransform: "none",
                  background: "white",
                }}
              >
                Send OTP
              </CustomButton>
            ) : (
              <Box component="form" className="forget-pass-form">
                {/* {[0, 1, 2, 3, 4, 5].map((digit, index) => (
                <CustomTextField
                  name={`otp${index}` as "otp0" | "otp1" | "otp2" | "otp3" | "otp4" | "otp5"}
                  control={control}
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
                  // onKeyDown={(e) => {
                  //   if (
                  //     !/^[0-9]$/.test(e.key) &&
                  //     e.key !== "Backspace" &&
                  //     e.key !== "Tab"
                  //   ) {
                  //     e.preventDefault(); // Blocks non-numeric input
                  //   }
                  // }}
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
                    onClick={handleSubmit(handleResendOTP)}
                    //onClick={handleResendOTP}
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
                <CustomButton
                  fullWidth
                  // onClick={handleSubmit(handleVerifyOTP)}
                  onClick={handleVerifyOTP}
                  customStyles={{
                    mt: 2,
                  }}
                >
                  Submit
                </CustomButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>

  );
};
