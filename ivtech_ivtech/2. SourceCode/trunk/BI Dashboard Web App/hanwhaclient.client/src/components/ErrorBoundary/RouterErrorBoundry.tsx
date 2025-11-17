import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import "../../css/RouterErrorBoundry.css";

const CustomErrorBoundary: React.FC<{ error?: Error }> = ({ error }) => {
  const routeError = useRouteError() as Error;

  const displayedError = error || routeError;
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // -1 means go back to previous page
  };
  return (
    <div className="error-page">
      <div>
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          Oops! The page you are looking for does not exist.
        </p>
        {displayedError && (
          <p className="error-message">{displayedError.message}</p>
        )}
        <button onClick={handleGoBack} className="error-link">
          Go Back
        </button>
      </div>
    </div>
  );
};

export { CustomErrorBoundary };
