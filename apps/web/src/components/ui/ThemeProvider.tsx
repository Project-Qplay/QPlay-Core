import React, { useEffect } from "react";
import { useSettings } from "../../contexts/SettingsContext";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    let theme = settings.theme;
    if (theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      theme = prefersDark ? "dark" : "light";
    }

    // Update CSS custom properties for theme
    if (theme === "light") {
      // Match values from index.css .light-theme
      root.style.setProperty("--bg-primary", "#f6f8fa");
      root.style.setProperty("--bg-secondary", "#eaf0fa");
      root.style.setProperty("--text-primary", "#22223b");
      root.style.setProperty("--text-secondary", "#5c5f7c");
      root.style.setProperty("--border-color", "#cbd5e1");
      root.style.setProperty("--accent", "#7c3aed");
      root.style.setProperty("--accent-secondary", "#a5b4fc");
      root.style.setProperty("--modal-bg", "#ffffffcc");
      root.style.setProperty("--modal-blur", "blur(8px)");
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    } else {
      // Match values from index.css .dark-theme
      root.style.setProperty("--bg-primary", "#0f172a");
      root.style.setProperty("--bg-secondary", "#1e293b");
      root.style.setProperty("--text-primary", "#f1f5f9");
      root.style.setProperty("--text-secondary", "#94a3b8");
      root.style.setProperty("--border-color", "#334155");
      root.style.setProperty("--accent", "#7c3aed");
      root.style.setProperty("--accent-secondary", "#a5b4fc");
      root.style.setProperty("--modal-bg", "#1e293bcc");
      root.style.setProperty("--modal-blur", "blur(8px)");
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
    }

    // Apply animation preferences
    if (!settings.animations) {
      root.style.setProperty("--animation-duration", "0s");
      root.style.setProperty("--transition-duration", "0s");
    } else {
      root.style.setProperty("--animation-duration", "0.3s");
      root.style.setProperty("--transition-duration", "0.2s");
    }

    // Apply particle effects
    if (!settings.particles) {
      root.classList.add("no-particles");
    } else {
      root.classList.remove("no-particles");
    }
  }, [settings.theme, settings.animations, settings.particles]);

  return <>{children}</>;
};
