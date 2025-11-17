// src/App.tsx
import React, { Suspense } from "react";
import './css/App.css'
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import RoutesConfig from "./routes/RoutesConfig";
import { Toast } from "./components/Reusable/Toast";
import { ThemeProvider } from "../src/context/ThemeContext";
import { RouterProvider } from "react-router-dom";
import { LoadingProvider } from "./context/LoadingContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import {UserProvider} from "./context/UserContext";

const App: React.FC = () => {
  return (
     <PermissionsProvider>
    <UserProvider>
    <LoadingProvider>
      <ErrorBoundary>
     
        <ThemeProvider>
          <Toast />
          <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={RoutesConfig} />
          </Suspense>
        </ThemeProvider>
      </ErrorBoundary>
    </LoadingProvider>
    </UserProvider>
    </PermissionsProvider>
  );
};

export default App;
