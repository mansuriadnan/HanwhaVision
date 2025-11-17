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
    return <div>Loading...</div>; 
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
