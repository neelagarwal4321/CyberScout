import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";
export type FontSize = "small" | "medium" | "large";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

// Darker accent variants for light mode (better contrast on bright backgrounds)
const LIGHT_ACCENT_MAP: Record<string, string> = {
  "#00E5FF": "#0088BB",
  "#39FF14": "#00921E",
  "#A855F7": "#7B2FBE",
  "#FF9F1C": "#C86400",
};

function applyAccentVars(root: HTMLElement, color: string) {
  root.style.setProperty("--accent-primary", color);
  root.style.setProperty("--ring", color);
  root.style.setProperty("--primary", color);
  root.style.setProperty("--accent", color);
  root.style.setProperty("--sidebar-primary", color);
  root.style.setProperty("--sidebar-ring", color);

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
    root.style.setProperty("--accent-primary-glow", `rgba(${r},${g},${b},0.22)`);
    root.style.setProperty("--accent-primary-dim",  `rgba(${r},${g},${b},0.09)`);
    root.style.setProperty("--border-glow",         `rgba(${r},${g},${b},0.28)`);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) ?? "dark";
  });
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return (localStorage.getItem("fontSize") as FontSize) ?? "medium";
  });
  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem("accentColor") ?? "#00E5FF";
  });

  // Theme class + accent color (accent visuals differ per theme)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("theme", theme);

    const effectiveColor =
      theme === "light" ? (LIGHT_ACCENT_MAP[accentColor] ?? accentColor) : accentColor;
    applyAccentVars(root, effectiveColor);
  }, [theme, accentColor]);

  // Font size — independent
  useEffect(() => {
    document.documentElement.style.setProperty("--font-size-base", FONT_SIZE_MAP[fontSize]);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const toggleTheme   = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const setFontSize   = (s: FontSize) => setFontSizeState(s);
  const setAccentColor = (c: string)  => setAccentColorState(c);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDark: theme === "dark", fontSize, setFontSize, accentColor, setAccentColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
