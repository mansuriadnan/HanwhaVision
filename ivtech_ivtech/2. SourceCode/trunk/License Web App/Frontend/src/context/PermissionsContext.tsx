import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type PermissionsContextType = {
  permissions: Object[];
  setPermissions: (permissions: Object[]) => void;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  
  const [permissions, setPermissions] = useState<any[]>(() => {
    const savedPermissions = localStorage.getItem("permissions");
    return savedPermissions ? JSON.parse(savedPermissions) : [];
  });


  useEffect(() => {
    localStorage.setItem("permissions", JSON.stringify(permissions));
  }, [permissions]);

  return (
    <PermissionsContext.Provider value={{ permissions, setPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};
