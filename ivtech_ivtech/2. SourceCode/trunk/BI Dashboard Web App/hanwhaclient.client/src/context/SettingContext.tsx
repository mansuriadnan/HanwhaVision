import { createContext, useContext, useEffect, useState } from "react";
import { IGeneralSettings } from "../interfaces/ISettings";

type SettingsContextType = {
  settings: IGeneralSettings | undefined;
  saveSettings: (settings: IGeneralSettings | null) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<IGeneralSettings | undefined>();

    useEffect(() => {
    const savedSettings = localStorage.getItem("generalSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);
  
  const saveSettings = (data: IGeneralSettings | null) => {
    if (data) {
      localStorage.setItem("generalSettings", JSON.stringify(data));
      setSettings(data);
    } else {
      localStorage.removeItem("generalSettings");
      setSettings(undefined);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettingsContext must be used within a SettingsProvider"
    );
  }
  return context;
};
