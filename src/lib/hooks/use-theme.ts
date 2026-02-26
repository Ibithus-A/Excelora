"use client";

import { THEME_STORAGE_KEY } from "@/lib/constants/storage";
import { useEffect, useState } from "react";

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeHydrated, setIsThemeHydrated] = useState(false);

  useEffect(() => {
    try {
      const persisted = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (persisted === "dark") {
        setIsDarkMode(true);
      }
    } finally {
      setIsThemeHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isThemeHydrated) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
    } catch {
      // Ignore quota/private mode failures.
    }
  }, [isDarkMode, isThemeHydrated]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
  }, [isDarkMode]);

  return { isDarkMode, setIsDarkMode };
}
