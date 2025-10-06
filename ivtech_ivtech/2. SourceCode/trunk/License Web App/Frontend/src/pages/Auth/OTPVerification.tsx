import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { useNavigate, Navigate } from "react-router-dom";
import {
  ForgotPasswordService,
  OtpVerificationService,
} from "../../services/userService";
import { showToast } from "../../components/index";


const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const resetEmail = sessionStorage.getItem("resetEmail");

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Check if email exists in sessionStorage
  if (!resetEmail) {
    return <Navigate to="/" />;
  }

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

  const handleResendOTP = async () => {
    try {
      // Add your resend OTP API call here
      // const result = await ResendOTPService({ email: resetEmail });

      try {
        const result = await ForgotPasswordService({
          email: resetEmail,
        });

        if (typeof result !== "string") {
          sessionStorage.setItem("resetEmail", resetEmail);
          navigate("/otp");
        }
      } catch (error) {
        console.error("Error resetting password:", error);
      }

      // Reset timer and disable resend button
      setTimeLeft(120);
      setCanResend(false);
      showToast("OTP resent successfully", "success");
    } catch (error) {
      console.error("Error resending OTP:", error);
      showToast("Failed to resend OTP", "error");
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
        email: resetEmail,
        otp: enteredOTP,
      });
      if (typeof result !== "string") {
        sessionStorage.setItem("otp", enteredOTP);
        navigate("/forgot-reset-password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  // Format time left into minutes and seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""
      }${seconds}`;
  };

  return (
    <Container maxWidth="sm">
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "100vh" }}>
        <Grid item xs={12} sm={8} md={5}>
          <IconButton onClick={() => navigate("/forgotpassword")}>
            <img src={"/images/backArrow.svg"} alt="back to login" width="24" height="24" />
          </IconButton>

          <Card
            elevation={3}
            className="forgotPasswordCard"
          >
            <CardContent sx={{ padding: 2 }}>
              <img src="/images/hanwhalogo.png" alt="Hanwha Vision" style={{ height: 40, marginBottom: 12 }} />
              <Typography variant="h5" fontWeight="bold" className="forgotPasswordtext">
                OTP Verification
              </Typography>

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
                  className="btnContained"
                >
                  Verify OTP
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {formatTimeLeft()}
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleResendOTP}
                    disabled={!canResend}
                  >
                    Resend OTP
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export { OTPVerification };
