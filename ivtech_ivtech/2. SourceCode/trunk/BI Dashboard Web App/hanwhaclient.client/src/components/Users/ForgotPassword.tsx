// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Container,
//   TextField,
//   Typography,
//   Paper,
//   Alert,
//   Grid2,
// } from "@mui/material";
// import { Link, useNavigate } from "react-router-dom";
// import { ForgotPasswordService } from "../../services/userService";
// import { showToast } from "../Reusable/Toast";

// // Email Validation Helper
// const validateEmail = (email: string): boolean => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// // ForgotPassword Component
// const ForgotPassword: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateEmail(email)) {
//       setError("Please enter a valid email address");
//       return;
//     }
//     try {
//       const result = await ForgotPasswordService({
//         email: email,
//       });

//       if (typeof result === "string") {
//         console.error("Error:", result);
//         showToast(result, "error");
//         // Handle error message
//       } else {
//         showToast(result.message, "success");
//         sessionStorage.setItem("resetEmail", email);
//         navigate("/otp");
//         // Handle success response
//       }
//     } catch (error) {
//       console.error("Error resetting password:", error);
//       // Handle error
//     }

//     // Simulated email validation
//     // In real-world, this would be an API call
//     // if (email === "user@example.com") {
//     //   // Store email in sessionStorage for next steps
//     //   sessionStorage.setItem("resetEmail", email);
//     //   navigate("/otp");
//     // } else {
//     //   setError("Email not registered");
//     // }
//   };

//   return (
//     <Container maxWidth="xs">
//       <Paper
//         elevation={3}
//         sx={{
//           padding: 4,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           marginTop: 8,
//         }}
//       >
//         <Typography variant="h5">Forgot Password</Typography>
//         <Box
//           component="form"
//           onSubmit={handleSubmit}
//           sx={{ width: "100%", mt: 1 }}
//         >
//           <TextField
//             margin="normal"
//             fullWidth
//             label="Email Address"
//             type="text"
//             value={email}
//             onChange={(e) => {
//               setEmail(e.target.value);
//               setError("");
//             }}
//             error={!!error}
//             variant="filled"
//           />
//           {error && <Alert severity="error">{error}</Alert>}
//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 3, mb: 2 }}
//           >
//             Send OTP
//           </Button>
//           <Grid2 container justifyContent={"flex-end"}>
//             <Box>
//               <Link to="/">Back To Login</Link>
//             </Box>
//           </Grid2>
//         </Box>
//       </Paper>
//     </Container>
//   );
// };

// export { ForgotPassword };

import React from "react";
import { Card, CardContent, Typography, Button, Container, Grid2, Box, Link } from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
// import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const handleContactAdmin = () => {
    alert("Please reach out to your administrator for password reset assistance.");
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100vh",
        alignItems: "center",
      }}
    >
      <Card sx={{ textAlign: "center", p: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <ContactSupportIcon sx={{ fontSize: 50, color: "#1976d2" }} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
            Need Help?
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
            Please contact the administrator to reset your password.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleContactAdmin}
          >
            Contact Admin
          </Button>
          <Box>
            <Link href="/" variant="body2" sx={{ mt: 2, display: "block", textDecoration: "none", color: "#1976d2" }}>
              Back to Login
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
