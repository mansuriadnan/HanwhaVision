// hooks/useTheme.ts
import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

function useTheme(): [Theme, () => void, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return [theme, toggleTheme, setTheme];
}

export default useTheme;
