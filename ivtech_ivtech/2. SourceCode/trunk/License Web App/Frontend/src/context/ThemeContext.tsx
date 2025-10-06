import React, { createContext, useContext } from "react";
import useTheme from "../hooks/useTheme";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, toggleTheme] = useTheme();

  const muiTheme = createTheme({
    palette: {
      mode: theme, // "light" or "dark"
    },
    typography: {
      fontFamily: "'Zen Kaku Gothic Antique', sans-serif", // Set font globally
    },
  });
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
       <MuiThemeProvider theme={muiTheme}>
      {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};
