import React, { createContext, useContext, useState, ReactNode } from "react";

interface LicenseContextType {
  isLicenseValid: boolean | null;
  setIsLicenseValid: (value: boolean) => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLicenseValid, setIsLicenseValid] = useState<boolean | null>(null);

  return (
    <LicenseContext.Provider value={{ isLicenseValid, setIsLicenseValid }}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = (): LicenseContextType => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
};
