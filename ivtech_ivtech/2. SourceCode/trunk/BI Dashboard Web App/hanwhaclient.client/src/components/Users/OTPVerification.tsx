import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate, Navigate } from "react-router-dom";
import { OtpVerificationService } from "../../services/userService";
import { showToast } from "../Reusable/Toast";

// OTP Component
const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if email exists in sessionStorage
  const resetEmail = sessionStorage.getItem("resetEmail");
  if (!resetEmail) return <Navigate to="/" />;

  const handleOTPChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(
          `otp-${index + 1}`
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if OTP is complete
    if (otp.some((digit) => digit === "")) {
      setError("Please enter complete OTP");
      return;
    }

    // Simulated OTP validation
    const enteredOTP = otp.join("");

    try {
      const result = await OtpVerificationService({
        email: sessionStorage.getItem("resetEmail"),
        otp: enteredOTP,
      });

      if (typeof result === "string") {
        console.error("Error:", result);
        showToast(result, "error");
        // Handle error message
      } else {
        // showToast(result.message, "success");
        sessionStorage.setItem("otp", enteredOTP);
        navigate("/forgot-reset-password");
        // Handle success response
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      // Handle error
    }

    // if (enteredOTP === "1234") {
    //   navigate("/forgot-reset-password");
    // } else {
    //   setError("Invalid OTP");
    // }
  };

  return (
    <Container maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Typography variant="h5">OTP Verification</Typography>
        <Box
          component="form"
          onSubmit={handleVerifyOTP}
          sx={{ width: "100%", mt: 1 }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                id={`otp-${index}`}
                variant="outlined"
                type="text"
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: "center" },
                }}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                sx={{ width: "20%" }}
              />
            ))}
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Verify OTP
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OTPVerification;
