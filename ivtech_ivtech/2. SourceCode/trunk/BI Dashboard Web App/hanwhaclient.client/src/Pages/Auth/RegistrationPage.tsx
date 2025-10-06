import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid2,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {User} from "../../interfaces/IUser";
import { createUser } from "../../services/userService";
import { UseApiHandler } from "../../hooks/UseApiHandler";
import { GetAllRoleService } from "../../services/roleService";
import { IRole } from "../../interfaces/IRolePermission";
import { showToast } from "../../components/Reusable/Toast";


interface Errors {
  userName?: string;
  email?: string;
  password?: string;
  selectedRole?: string;
}

const RegistrationPage: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [roles, setRoles] = useState<IRole[]>([]);
  const [user, setUser] = useState<User>({
    id: "",
    userName: "",
    email: "",
    password: "",
    roleId: "",
  });
  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!userName) newErrors.userName = "UserName is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!selectedRole || selectedRole === "default")
      newErrors.selectedRole = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(e.target.value);
  };

  const { loading, error, handleApiCall } = UseApiHandler<User, User>();

  useEffect(() => {
    const getRoles = async () => {
      try {
        const rolesData = await GetAllRoleService();
        setRoles(rolesData);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        return loading;
      }
    };

    getRoles();
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validate()) {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const userNew: User = {
        userName: formData.get("userName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        roleId: formData.get("roleId") as string,
      };

      setUser(userNew);
      // Submit form
      try {
        const result = await handleApiCall(createUser, userNew); // Pass userNew directly
        if (typeof result === "string") {
          // Handle error message
          showToast(result, "error");
        } else if (result != null) {
          showToast(
            "Registration successful! Redirecting you to the login page...",
            "success"
          );
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Error creating user:", err);
      }
    }
  };

  return (
    <>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            mt: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
            <LockOutlined />
          </Avatar>
          <Typography variant="h5">Register</Typography>
          <form onSubmit={handleRegister} noValidate>
            <Box sx={{ mt: 3 }}>
              <Grid2 container spacing={2}>
                <Box sx={{ width: "100%" }}>
                  <TextField
                    name="userName"
                    required
                    fullWidth
                    id="userName"
                    label="UserName"
                    autoFocus
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    error={!!errors.userName}
                    helperText={errors.userName}
                    variant="filled"
                  />
                </Box>

                <Box sx={{ width: "100%" }}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    variant="filled"
                  />
                </Box>

                <Box sx={{ width: "100%" }}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    variant="filled"
                  />
                </Box>

                <Box sx={{ width: "100%" }}>
                  <TextField
                    select
                    fullWidth
                    label="Role"
                    name="roleId"
                    value={selectedRole}
                    onChange={handleRoleChange}
                    error={!!errors.selectedRole}
                    helperText={errors.selectedRole}
                    variant="filled"
                  >
                    <MenuItem value="default">Select Role</MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.roleName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Grid2>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                type="submit"
              >
                Register
              </Button>

              <Box display="flex" justifyContent="flex-end">
                <Stack direction="row" spacing={2}>
                  <Link to="/login">Already have an account? Login</Link>
                </Stack>
              </Box>
            </Box>
            {error && <p>{error}</p>}
          </form>
        </Box>
      </Container>
    </>
  );
};

export default RegistrationPage;
