// LoadingContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LoadingManager } from "../utils/LoadingManager";

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to loading state changes
    return LoadingManager.subscribe(setIsLoading);
  }, []);

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {children}
    </>
  );
};

// Custom hook to use the loading context
// export const useLoading = (): LoadingContextType => {
//   const context = useContext(LoadingContext);
//   if (!context) {
//     throw new Error("useLoading must be used within a LoadingProvider");
//   }
//   return context;
// };

// Loading spinner component
// const LoadingSpinner: React.FC = () => {
//   return (
//     <div style={loaderStyle}>
//       <div style={spinnerStyle}></div>
//       <p>Loading...</p>
//     </div>
//   );
// };

// const loaderStyle: React.CSSProperties = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   backgroundColor: "rgba(0, 0, 0, 0.5)",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   color: "white",
//   zIndex: 1000,
// };

// const spinnerStyle: React.CSSProperties = {
//   width: "50px",
//   height: "50px",
//   border: "5px solid rgba(255, 255, 255, 0.3)",
//   borderTop: "5px solid white",
//   borderRadius: "50%",
//   animation: "spin 1s linear infinite",
// };
