import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";
// A media query that is true when the operating system is set to dark mode
const SYSTEM_DARK = "(prefers-color-scheme: dark)";

// The theme to start with: the user's saved choice, otherwise the system setting
function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia(SYSTEM_DARK).matches ? "dark" : "light";
}

/**
 * useTheme - a custom hook that manages light/dark mode.
 *
 * Returns { theme, toggleTheme }:
 *   theme       - "light" or "dark"
 *   toggleTheme - switches between them and remembers the choice
 *
 * How it works: it sets <html data-theme="dark"> (or "light"), and App.css
 * uses that attribute to swap its color variables.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // Whenever the theme changes, apply it to the <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Until the user picks a theme themselves, follow the system setting live
  // (e.g. macOS switching to dark mode automatically in the evening)
  useEffect(() => {
    const media = window.matchMedia(SYSTEM_DARK);
    const handleChange = (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) setTheme(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange); // clean up on unmount
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next); // remember the user's choice
    setTheme(next);
  };

  return { theme, toggleTheme };
}
