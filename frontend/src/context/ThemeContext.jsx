import { createContext, useState, useEffect } from "react";
import { colors } from "../styles/colors";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const theme = darkMode ? colors.dark : colors.light;

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = theme.page;
    document.body.style.color = theme.text;
    document.body.style.transition =
      "background 0.3s ease, color 0.3s ease";

    const root = document.getElementById("root");

    if (root) {
      root.style.minHeight = "100vh";
      root.style.background = theme.page;
      root.style.color = theme.text;
      root.style.transition =
        "background 0.3s ease, color 0.3s ease";
    }
  }, [darkMode, theme]);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};