import { RouteObject } from "react-router-dom"; 
import ProtectedRoute from "./ProtectedRoute";
import * as PagesComponents from "../pages"; 
import { Dashboard } from "../pages/Dashboard/Dashboard";
import * as Components from "../components"; 


const {
  ChangePasswordPage,
  UserManagementPage,
  RolesListPage,
  RolePermissionsManagement,
  ClientManagement,
  LicenseManagement,
  LicenseAddEditPage,
  DistributorManagement,
  ProfilePage,
  WelcomePage,
} = PagesComponents;

const protectedRoutes = [
  "/dashboard",
  "/user",
  "/permissions",
  "/addedituser",
  "/roles",
  "/roleaddedit",
  "/screen-management",
  "/changepassword",
  "/sites",
  "/client-management",
  "/clientaddedit",
  "/license-management",
  "/licenseaddedit",
  "/distributer-management",
  "/profile",
  "/welcome"
];

export const ChildrenRoutes = (): RouteObject[] => {
  const routes = [
    {
      path: "/dashboard",
      element: <Dashboard />
    },
    {
      path: "/user",
      element: <UserManagementPage />,
    },
    {
      path: "/roles",
      element: <RolesListPage />,
    },
    {
      path: "/screen-management",
      element: <RolePermissionsManagement />,
    },
    {
      path: "/client-management",
      element: <ClientManagement />,
    },
    {
      path: "/distributer-management",
      element: <DistributorManagement />,
    },
    {
      path: "/license-management",
      element: <LicenseManagement/>,
    },
    {
      path: "/licenseaddedit",
      element: <LicenseAddEditPage />,
    },
    {
      path: "/changepassword",
      element: <ChangePasswordPage />,
    },
    {
      path: "/profile",
      element: <ProfilePage />,
    },
    {
      path: "/welcome",
      element: <WelcomePage />,
    },
  ];

  return routes.map((route) => {
    // Check if the route is protected
    if (protectedRoutes.includes(route.path)) {
      return {
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      };
    }
    return route;
  });
};
