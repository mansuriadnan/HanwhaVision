// src/App.tsx
import React, { Suspense, useEffect, useLayoutEffect } from "react";

import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import RoutesConfig from "./routes/RoutesConfig";
import { Toast } from "./components/Reusable/Toast";
import { ThemeProvider } from "../src/context/ThemeContext";
import { RouterProvider } from "react-router-dom";
import { LoadingProvider } from "./context/LoadingContext";
import { LicenseProvider } from "./context/LicenseContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import "./css/App.css";
import { UserProvider } from "./context/UserContext";
import { SettingsProvider } from "./context/SettingContext";
import { MapDataProvider } from "./context/MapContext";
import { SignalRProvider } from "./context/SignalRContext";

const App: React.FC = () => {
  // useEffect(() => {
  //   const savedTheme = localStorage.getItem("theme") || "light";

  //   // console.log("savedTheme =>",savedTheme)
  //   document.body.classList.remove("light", "dark");
  //   document.body.classList.add(savedTheme);
  // }, []);
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);
  }, []);

  return (
    <UserProvider>
      <LoadingProvider>
        <ErrorBoundary>
          <PermissionsProvider>
            <ThemeProvider>
              <Toast />
              <LicenseProvider>
                <SettingsProvider>
                  <MapDataProvider>
                    <SignalRProvider>
                      <Suspense fallback={<div>Loading...</div>}>
                        <RouterProvider router={RoutesConfig} />
                      </Suspense>
                    </SignalRProvider>
                  </MapDataProvider>
                </SettingsProvider>
              </LicenseProvider>
            </ThemeProvider>
          </PermissionsProvider>
        </ErrorBoundary>
      </LoadingProvider>
    </UserProvider>
  );
};

export default App;
