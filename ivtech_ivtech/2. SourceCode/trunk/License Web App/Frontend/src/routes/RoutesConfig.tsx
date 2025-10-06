import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { ChildrenRoutes } from "./ChildrenRoutes";
import MinimalLayout from "../layout/MinimalLayout";
import { CustomErrorBoundary } from "../components";
import {
  LoginPage,
  ForgotPassword,
  OTPVerification,
  ResetPassword,
} from "../pages";


const RoutesConfig = createBrowserRouter([
  {
    element: <MinimalLayout />,
    errorElement: <CustomErrorBoundary />,
    children: [
      { path: "/", element: <LoginPage /> },
      { path: "/login", element: <LoginPage /> },
      //{ path: "/registration", element: <RegistrationPage /> },
      {
        path: "/forgotpassword",
        element: <ForgotPassword />,
      },
      {
        path: "/otp",
        element: <OTPVerification />,
      },
      {
        path: "/forgot-reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  {
    element: <MainLayout />,
    errorElement: <CustomErrorBoundary />,
    children: ChildrenRoutes(), // Assuming PermissionsRoutes returns the route elements
  },
]);

export default RoutesConfig;
