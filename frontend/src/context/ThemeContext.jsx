import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    document.body.style.background = darkMode ? "#0f172a" : "#5797d6";
    document.body.style.color = darkMode ? "white" : "#111";
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};