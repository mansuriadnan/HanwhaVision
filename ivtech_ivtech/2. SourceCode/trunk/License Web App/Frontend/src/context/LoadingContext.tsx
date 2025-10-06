// LoadingContext.tsx
import React, { createContext, useEffect, useState } from "react";
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
