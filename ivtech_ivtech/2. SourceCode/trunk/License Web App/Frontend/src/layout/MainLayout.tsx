import React from "react";
import { Sidebar } from "../../src/components/Layout/Sidebar";
import { useThemeContext } from "../context/ThemeContext";
import { Header } from "../components";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <div className="main-layout">
      {/* Header Fixed on Top */}
      <Header/>

      <div className="content">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Section */}
        <main
          className={`main-content ${
            theme === "light" ? "main-content-light" : "main-content-dark"
          }`}
        >
          {/* Your Page Content Goes Here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
