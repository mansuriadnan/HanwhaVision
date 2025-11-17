// src/components/ErrorBoundary.tsx
import React, { ReactNode, useState, useEffect } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
      setHasError(true);
    };

    const errorListener = (event: ErrorEvent) => {
      handleError(event.error, { componentStack: "" });
    };

    window.addEventListener("error", errorListener);

    return () => {
      window.removeEventListener("error", errorListener);
    };
  }, []);

  if (hasError) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Oops! Something went wrong</h2>
      </div>
    );
  }

  return <>{children}</>;
};

export { ErrorBoundary };
