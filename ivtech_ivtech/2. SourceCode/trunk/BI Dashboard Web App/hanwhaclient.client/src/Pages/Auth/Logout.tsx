import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // Adjust the import path as needed

const Logout = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    handleLogout();
    navigate("/login");
  }, [handleLogout, navigate]);

  return null;
};

export default Logout;
