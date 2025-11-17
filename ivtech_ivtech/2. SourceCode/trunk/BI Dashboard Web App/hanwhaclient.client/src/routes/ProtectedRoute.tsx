import React, { ReactElement, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactElement; // or ReactNode if you prefer
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthToken = () => {
      const authToken = localStorage.getItem("accessToken");
      if (authToken) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate("/login");
      }
      setLoading(false);
    };

    checkAuthToken();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Optionally show a loading indicator
  }

  //return isAuthenticated ? children : <Navigate to="/login" />;

  var isLicenseValid = localStorage.getItem("isLicenseValid");

  const allowedWithoutLicense = ["/welcome", "/license"];
  if (
    isLicenseValid === "false" &&
    !allowedWithoutLicense.includes(location.pathname)
  ) {
    return <Navigate to="/license" replace />;
  }

  return children;
};

export default ProtectedRoute;
