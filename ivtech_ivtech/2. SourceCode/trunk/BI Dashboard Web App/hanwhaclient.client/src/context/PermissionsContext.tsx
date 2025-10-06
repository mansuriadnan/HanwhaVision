import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type PermissionsContextType = {
  permissions: Object[];
  setPermissions: (permissions: Object[]) => void;
  widgetPermissions: Object[];
  setWidgetPermissions: (permissions: Object[]) => void;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  // Initialize permissions from localStorage
  const [permissions, setPermissions] = useState<any[]>(() => {
    const savedPermissions = localStorage.getItem("permissions");
    return savedPermissions ? JSON.parse(savedPermissions) : [];
  });

  const [widgetPermissions, setWidgetPermissions] = useState<Object[]>(() => {
    const saved = localStorage.getItem("widgetPermissions");
    return saved ? JSON.parse(saved) : [];
  });


  useEffect(() => {
    
    localStorage.setItem("permissions", JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem("widgetPermissions", JSON.stringify(widgetPermissions));
  }, [widgetPermissions]);

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        setPermissions,
        widgetPermissions,
        setWidgetPermissions,
      }}
    >
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
