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
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { ForgotPasswordResetService } from "../../services/userService";
import { showToast } from "../Reusable/Toast";

// Password Validation Helper
const validatePassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

// Reset Password Component
const ChangePassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if email exists in sessionStorage
  const resetEmail = sessionStorage.getItem("resetEmail");
  if (!resetEmail) return <Navigate to="/" />;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters, contain uppercase, lowercase, and number"
      );
      return;
    }

    // Confirm password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const result = await ForgotPasswordResetService({
        email: sessionStorage.getItem("resetEmail"),
        otp: sessionStorage.getItem("otp"),
        newPassword: password,
        confirmPassword: confirmPassword,
      });

      if (typeof result === "string") {
        console.error("Error:", result);
        showToast(result, "error");
        // Handle error message
      } else {
        showToast(result.message, "success");
        //navigate("/login");
        // Handle success response
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      // Handle error
    }

    // Simulated password reset
    // In real-world, this would be an API call to update password
    //alert("Password Reset Successfully!");
    sessionStorage.removeItem("resetEmail");
    navigate("/");
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
        <Typography variant="h5">Reset Password</Typography>
        <Box
          component="form"
          onSubmit={handleResetPassword}
          sx={{ width: "100%", mt: 1 }}
        >
          <TextField
            margin="normal"
            //required
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            error={!!error}
            variant="filled"
          />
          <TextField
            margin="normal"
            //required
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            error={!!error}
            variant="filled"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Change Password
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export { ChangePassword };
