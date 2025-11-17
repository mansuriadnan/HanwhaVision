import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { ChildrenRoutes } from "./ChildrenRoutes";
import MinimalLayout from "../layout/MinimalLayout";
import { CustomErrorBoundary } from "../components/ErrorBoundary/RouterErrorBoundry";

const ForgotPassword = lazy(() => import("../components/Users/ForgotPassword"));
const OTPVerification = lazy(
  () => import("../components/Users/OTPVerification")
);
const ResetPassword = lazy(() => import("../components/Users/ResetPassword"));
const LoginPage = lazy(() => import("../Pages/Auth/LoginPage"));
const RegistrationPage = lazy(() => import("../Pages/Auth/RegistrationPage"));
const ReportSchedulerWidgetPdf = lazy(
  () =>
    import(
      "../components/Dashboard/Chart_Polygon/ReportSchedulerWidgetPDF/ReportSchedulerWidgetPdf"
    )
);

const RoutesConfig = createBrowserRouter([
  {
    element: <MinimalLayout />,
    errorElement: <CustomErrorBoundary />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<p>Loading...</p>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<p>Loading...</p>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "/registration",
        element: (
          <Suspense fallback={<p>Loading...</p>}>
            <RegistrationPage />
          </Suspense>
        ),
      },
      {
        path: "/forgotpassword",
        element: (
          <Suspense fallback={<p>Loading...</p>}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "/otp",
        element: (
          <Suspense fallback={<p>Loading...</p>}>
            <OTPVerification />
          </Suspense>
        ),
      },
      {
        path: "/forgot-reset-password",
        element: (
          <Suspense fallback={<p>Loading...</p>}>
            <ResetPassword />
          </Suspense>
        ),
      },
      {
        path: "/report-scheduler-pdf",
        element: (
          <Suspense fallback={<p>Loading...</p>}>
            <ReportSchedulerWidgetPdf />
          </Suspense>
        ),
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
