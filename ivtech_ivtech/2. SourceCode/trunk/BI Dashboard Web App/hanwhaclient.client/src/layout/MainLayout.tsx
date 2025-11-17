// MainLayout.tsx
import React, { useEffect } from "react";
import { useThemeContext } from "../context/ThemeContext";
import { Outlet } from "react-router-dom";
import {
  startSignalRConnection,
  stopSignalRConnection,
} from "../utils/signalRService";
import { Sidebar } from "../components/Layout/Sidebar";
import { Header } from "../components/Layout/Header";


const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useThemeContext();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);

    startSignalRConnection();

    return () => {
      stopSignalRConnection();
    };
  }, []);

  window.addEventListener("beforeunload", () => {
    stopSignalRConnection();
  });

  return (
    <div className="main-layout">
      <Header />
      <div className="content">
        <Sidebar />

        <main
          className={`main-content ${
            theme === "light" ? "main-content-light" : "main-content-dark"
          }`}
        >
               
          {/* Your Page Content Goes Here */}
          <Outlet />
          
        </main>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;
