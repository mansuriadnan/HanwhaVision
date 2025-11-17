import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
const ErrorLogsPage = lazy(() => import("../Pages/ErrorLogs/ErrorLogsPage"));
const UserManagementPage = lazy(() => import("../Pages/User/UserManagement"));
const DeviceManagement = lazy(() => import("../Pages/Camera/DeviceManagement"));
const Logout = lazy(() => import("../Pages/Auth/Logout"));
const FloorPlansAndZonesPage = lazy(
  () => import("../Pages/FloorPlansAndZones/FloorPlansAndZonesPage")
);
const MultisiteSetupPage = lazy(
  () => import("../Pages/MutlisiteSetup/MultisiteSetupPage")
);
const RolesAndPermissionsPage = lazy(
  () => import("../Pages/RolesAndPermissions/RolesAndPermissionsPage")
);
const SettingGeneralPage = lazy(
  () => import("../Pages/Settings/SettingGeneralPage")
);
const SettingLicensePage = lazy(
  () => import("../Pages/Settings/SettingLicensePage")
);
const MonitoringPage = lazy(() => import("../Pages/Monitoring/MonitoringPage"));
const WelcomePage = lazy(() => import("../Pages/Welcome/WelcomePage"));
const DashboardPage = lazy(
  () => import("../Pages/DashBoard_Home/DashboardPage")
);
const EventlogsManagement = lazy(
  () => import("../Pages/Eventlogs/EventlogsManagement")
);
const ReportsPage = lazy(() => import("../Pages/MyReports/ReportsPage"));
const BackupRestorePage = lazy(
  () => import("../Pages/BackupRestore/BackupRestorePage")
);

const protectedRoutes = [
  "/dashboard",
  // "/dashboard/:id",
  "/manage-users",
  "/addedituser",
  "/roles",
  "/roleaddedit",
  "/screen-management",
  "/changepassword",
  "/sites",
  "/siteaddedit",
  "/zones",
  "/manage-devices",
  "/cameraaddedit",
  "/floorplans-and-zones",
  "/add-devices",
  "/multisite-setup",
  "/roles-and-permissions",
  "/google-map",
  "/general-settings",
  "/license",
  "/manage-eventlogs",
  "/reports",
  "/welcome",
  "/backup-and-restore",
  "/monitoring",
];

export const ChildrenRoutes = (): RouteObject[] => {
  const routes = [
    {
      path: "/dashboard",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <DashboardPage />
        </Suspense>
      ),
    },
    // {
    //   path: "/dashboard/:id",
    //   element: <DashboardPage />,
    // },
    {
      path: "/manage-users",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <UserManagementPage />
        </Suspense>
      ),
    },
    // {
    //   path: "/addedituser",
    //   element: <UserAddEditForm />,
    // },
    // {
    //   path: "/roles",
    //   element: <RolesListPage />,
    // },
    // {
    //   path: "/roleaddedit",
    //   element: <RoleAddEditPage />,
    // },
    // {
    //   path: "/screen-management",
    //   element: <RolePermissionsManagement />,
    // },
    // {
    //   path: "/changepassword",
    //   element: <ChangePasswordPage />,
    // },
    // {
    //   path: "/sites",
    //   element: <SiteList />,
    // },
    // {
    //   path: "/siteaddedit",
    //   element: <SiteAddEdit />,
    // },
    {
      path: "/manage-devices",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <DeviceManagement />
        </Suspense>
      ),
    },
    // {
    //   path: "/cameraaddedit",
    //   element: <DeviceAddEdit/>,
    // },

    // {
    //   path: "/zones",
    //   element: <ZonePage />,
    // },
    {
      path: "/logout",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <Logout />
        </Suspense>
      ),
    },
    // {
    //   path: "/emailtemplates",
    //   element: <EmailTemplatesPage />,
    // },
    {
      path: "/floorplans-and-zones",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <FloorPlansAndZonesPage />
        </Suspense>
      ),
    },
    {
      path: "/multisite-setup",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <MultisiteSetupPage />
        </Suspense>
      ),
    },
    {
      path: "/roles-and-permissions",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <RolesAndPermissionsPage />
        </Suspense>
      ),
    },
    {
      path: "/general-settings",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <SettingGeneralPage />
        </Suspense>
      ),
    },
    {
      path: "/license",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <SettingLicensePage />
        </Suspense>
      ),
    },
    {
      path: "/manage-eventlogs",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <EventlogsManagement />
        </Suspense>
      ),
    },
    {
      path: "/monitoring",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <MonitoringPage />
        </Suspense>
      ),
    },
    {
      path: "/reports",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <ReportsPage />
        </Suspense>
      ),
    },
    {
      path: "/backup-and-restore",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <BackupRestorePage />
        </Suspense>
      ),
    },
    {
      path: "/welcome",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <WelcomePage />
        </Suspense>
      ),
    },
    {
      path: "/exception-logs",
      element: (
        <Suspense fallback={<p>Loading...</p>}>
          <ErrorLogsPage />
        </Suspense>
      ),
    },
  ];

  return routes.map((route) => {
    var isLicenseValid = localStorage.getItem("isLicenseValid"); // ✅ Now inside the component
    // Check if the route is protected
    //console.log("isLicenseValid children= ", isLicenseValid);
    if (protectedRoutes.includes(route.path)) {
      return {
        ...route,
        element:
          isLicenseValid === "true" || isLicenseValid == null ? (
            <ProtectedRoute>{route.element}</ProtectedRoute>
          ) : (
            <>
              {console.log("isLicenseValid children in= ", isLicenseValid)}
              {console.log("isLicenseValid route.path= ", route.path)}
              <ProtectedRoute>
                {route.path === "/welcome" ? (
                  <WelcomePage />
                ) : (
                  <>
                    {console.log("isLicenseValid route.license= ", route.path)}
                    <SettingLicensePage />
                  </>
                )}
              </ProtectedRoute>
            </>
          ),
        //<ProtectedRoute>{route.element}</ProtectedRoute>,
      };
    }
    return route;
  });
};
