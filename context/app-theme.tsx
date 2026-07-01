import React, { createContext, useContext, useMemo, useState } from "react";

export type AppTheme = "light" | "dark";

export type AppThemeColors = {
  background: string;
  card: string;
  border: string;
  title: string;
  subtitle: string;
  text: string;
  muted: string;
  rowBg: string;
  rowIconBg: string;
  rowIcon: string;
  chevron: string;
  divider: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
};

type AppThemeContextValue = {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: AppThemeColors;
};

const lightColors: AppThemeColors = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  title: "#0F172A",
  subtitle: "#64748B",
  text: "#0F172A",
  muted: "#64748B",
  rowBg: "#FFFFFF",
  rowIconBg: "#EEF2FF",
  rowIcon: "#4F46E5",
  chevron: "#94A3B8",
  divider: "#F1F5F9",
  tabBarBackground: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  tabBarActive: "#4F46E5",
  tabBarInactive: "#94A3B8",
};

const darkColors: AppThemeColors = {
  background: "#0F172A",
  card: "#111827",
  border: "#1F2937",
  title: "#F8FAFC",
  subtitle: "#CBD5E1",
  text: "#E2E8F0",
  muted: "#94A3B8",
  rowBg: "#0B1220",
  rowIconBg: "#1E293B",
  rowIcon: "#A5B4FC",
  chevron: "#94A3B8",
  divider: "#1F2937",
  tabBarBackground: "#111827",
  tabBarBorder: "#1F2937",
  tabBarActive: "#A5B4FC",
  tabBarInactive: "#94A3B8",
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined,
);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>("light");

  const value = useMemo<AppThemeContextValue>(() => {
    const isDarkMode = theme === "dark";

    return {
      theme,
      isDarkMode,
      toggleTheme: () =>
        setTheme((current) => (current === "light" ? "dark" : "light")),
      colors: isDarkMode ? darkColors : lightColors,
    };
  }, [theme]);

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}
