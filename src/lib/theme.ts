export type ThemeColor = string;
export type ThemeMode = "dark" | "light" | "system";

export interface SurfacePalette {
  bg: string;
  card: string;
  border: string;
  surface50: string;
  surface100: string;
  surface200: string;
  surface300: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  nameFa: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  isCustom?: boolean;
  darkSurface?: Partial<SurfacePalette>;
  lightSurface?: Partial<SurfacePalette>;
}

export const THEME_PALETTES: Record<string, ThemeConfig> = {
  purple: {
    id: "purple",
    name: "Modern Purple",
    nameFa: "بنفش مدرن (پیش‌فرض)",
    primary: "#7c3aed",
    primaryLight: "#a78bfa",
    primaryDark: "#5b21b6",
    accent: "#c084fc",
    darkSurface: {
      bg: "#0b0813",
      card: "#151026",
      border: "rgba(167, 139, 250, 0.12)",
      surface50: "#1a1333",
      surface100: "#221944",
      surface200: "#2d215b",
      surface300: "#3d2d7a",
    },
    lightSurface: {
      bg: "#fdfcff",
      card: "#ffffff",
      border: "#ede9fe",
      surface50: "#f8f5ff",
      surface100: "#f1ebff",
      surface200: "#e5dbff",
      surface300: "#d3c4fc",
    },
  },
  blue: {
    id: "blue",
    name: "Ocean Blue",
    nameFa: "آبی اقیانوسی",
    primary: "#2563eb",
    primaryLight: "#60a5fa",
    primaryDark: "#1d4ed8",
    accent: "#38bdf8",
    darkSurface: {
      bg: "#060f1e",
      card: "#0b1933",
      border: "rgba(96, 165, 250, 0.14)",
      surface50: "#0f2347",
      surface100: "#142e5c",
      surface200: "#1b3c75",
      surface300: "#234e96",
    },
    lightSurface: {
      bg: "#f8faff",
      card: "#ffffff",
      border: "#dbeafe",
      surface50: "#eff6ff",
      surface100: "#e0edff",
      surface200: "#bfdbfe",
      surface300: "#93c5fd",
    },
  },
  green: {
    id: "green",
    name: "Emerald Green",
    nameFa: "سبز زمردی",
    primary: "#059669",
    primaryLight: "#34d399",
    primaryDark: "#047857",
    accent: "#10b981",
    darkSurface: {
      bg: "#04140e",
      card: "#092218",
      border: "rgba(52, 211, 153, 0.14)",
      surface50: "#0d2e21",
      surface100: "#123c2c",
      surface200: "#184d38",
      surface300: "#1f6248",
    },
    lightSurface: {
      bg: "#f7fdfa",
      card: "#ffffff",
      border: "#d1fae5",
      surface50: "#ecfdf5",
      surface100: "#dcfce7",
      surface200: "#a7f3d0",
      surface300: "#6ee7b7",
    },
  },
  cyan: {
    id: "cyan",
    name: "Turquoise",
    nameFa: "فیروزه‌ای جذاب",
    primary: "#0891b2",
    primaryLight: "#22d3ee",
    primaryDark: "#0e7490",
    accent: "#06b6d4",
    darkSurface: {
      bg: "#041419",
      card: "#08222a",
      border: "rgba(34, 211, 238, 0.14)",
      surface50: "#0c2e38",
      surface100: "#103c4a",
      surface200: "#154d5e",
      surface300: "#1c637a",
    },
    lightSurface: {
      bg: "#f6fdfe",
      card: "#ffffff",
      border: "#cffafe",
      surface50: "#ecfeff",
      surface100: "#dcf6f9",
      surface200: "#a5f3fc",
      surface300: "#67e8f9",
    },
  },
  pink: {
    id: "pink",
    name: "Neon Pink",
    nameFa: "صورتی نئونی",
    primary: "#db2777",
    primaryLight: "#f472b6",
    primaryDark: "#be185d",
    accent: "#f43f5e",
    darkSurface: {
      bg: "#17060f",
      card: "#260c1c",
      border: "rgba(244, 114, 182, 0.15)",
      surface50: "#361128",
      surface100: "#471836",
      surface200: "#5c2046",
      surface300: "#752a5a",
    },
    lightSurface: {
      bg: "#fff8fb",
      card: "#ffffff",
      border: "#fce7f3",
      surface50: "#fdf2f8",
      surface100: "#fce4f0",
      surface200: "#fbcfe8",
      surface300: "#f9a8d4",
    },
  },
  red: {
    id: "red",
    name: "Crimson Red",
    nameFa: "قرمز یاقوتی",
    primary: "#dc2626",
    primaryLight: "#f87171",
    primaryDark: "#b91c1c",
    accent: "#ef4444",
    darkSurface: {
      bg: "#170606",
      card: "#260c0c",
      border: "rgba(248, 113, 113, 0.15)",
      surface50: "#361212",
      surface100: "#481919",
      surface200: "#5d2121",
      surface300: "#782c2c",
    },
    lightSurface: {
      bg: "#fff8f8",
      card: "#ffffff",
      border: "#fee2e2",
      surface50: "#fef2f2",
      surface100: "#fee8e8",
      surface200: "#fecaca",
      surface300: "#fca5a5",
    },
  },
  orange: {
    id: "orange",
    name: "Sunset Orange",
    nameFa: "نارنجی غروب",
    primary: "#ea580c",
    primaryLight: "#fb923c",
    primaryDark: "#c2410c",
    accent: "#f97316",
    darkSurface: {
      bg: "#160802",
      card: "#261005",
      border: "rgba(251, 146, 60, 0.15)",
      surface50: "#381909",
      surface100: "#4a220d",
      surface200: "#5e2c12",
      surface300: "#7a3919",
    },
    lightSurface: {
      bg: "#fffaf6",
      card: "#ffffff",
      border: "#ffedd5",
      surface50: "#fff7ed",
      surface100: "#ffedd9",
      surface200: "#fed7aa",
      surface300: "#fdba74",
    },
  },
  gold: {
    id: "gold",
    name: "Royal Gold",
    nameFa: "طلایی لوکس",
    primary: "#d97706",
    primaryLight: "#fbbf24",
    primaryDark: "#b45309",
    accent: "#f59e0b",
    darkSurface: {
      bg: "#150d03",
      card: "#241807",
      border: "rgba(251, 191, 36, 0.15)",
      surface50: "#33230c",
      surface100: "#453012",
      surface200: "#573d18",
      surface300: "#704f21",
    },
    lightSurface: {
      bg: "#fffdf7",
      card: "#ffffff",
      border: "#fef3c7",
      surface50: "#fffbeb",
      surface100: "#fef7d9",
      surface200: "#fde68a",
      surface300: "#fcd34d",
    },
  },
};

// Convert hex to rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Generate full dynamic CSS variables for colors, surfaces and card backgrounds
export function getThemeCssVariables(
  color: string,
  mode: ThemeMode,
  customPalettes?: Record<string, ThemeConfig>
): Record<string, string> {
  const merged = { ...THEME_PALETTES, ...(customPalettes || {}) };
  const palette = merged[color] || merged.purple || THEME_PALETTES.purple;
  const isDark = mode === "dark";

  // If custom theme without pre-baked surfaces, derive from primary color
  let surfaces: SurfacePalette;
  if (isDark) {
    if (palette.darkSurface?.bg) {
      surfaces = {
        bg: palette.darkSurface.bg,
        card: palette.darkSurface.card || "#151026",
        border: palette.darkSurface.border || "rgba(255, 255, 255, 0.08)",
        surface50: palette.darkSurface.surface50 || "#1c1630",
        surface100: palette.darkSurface.surface100 || "#231c3d",
        surface200: palette.darkSurface.surface200 || "#2c234d",
        surface300: palette.darkSurface.surface300 || "#3b3064",
      };
    } else {
      const { r, g, b } = hexToRgb(palette.primary);
      const bgR = Math.round(r * 0.06);
      const bgG = Math.round(g * 0.06);
      const bgB = Math.round(b * 0.06);
      const cardR = Math.round(r * 0.12);
      const cardG = Math.round(g * 0.12);
      const cardB = Math.round(b * 0.12);
      surfaces = {
        bg: `rgb(${bgR}, ${bgG}, ${bgB})`,
        card: `rgb(${cardR}, ${cardG}, ${cardB})`,
        border: `rgba(${r}, ${g}, ${b}, 0.15)`,
        surface50: `rgb(${Math.round(r * 0.18)}, ${Math.round(g * 0.18)}, ${Math.round(b * 0.18)})`,
        surface100: `rgb(${Math.round(r * 0.24)}, ${Math.round(g * 0.24)}, ${Math.round(b * 0.24)})`,
        surface200: `rgb(${Math.round(r * 0.30)}, ${Math.round(g * 0.30)}, ${Math.round(b * 0.30)})`,
        surface300: `rgb(${Math.round(r * 0.40)}, ${Math.round(g * 0.40)}, ${Math.round(b * 0.40)})`,
      };
    }

    return {
      "--color-primary-50": "#f5f3ff",
      "--color-primary-100": "#ede9fe",
      "--color-primary-200": "#ddd6fe",
      "--color-primary-300": "#c4b5fd",
      "--color-primary-400": palette.primaryLight || palette.primary,
      "--color-primary-500": palette.primary,
      "--color-primary-600": palette.primary,
      "--color-primary-700": palette.primaryDark || palette.primary,
      "--color-primary-800": palette.primaryDark || "#4c1d95",
      "--color-primary-900": "#2e1065",
      "--color-surface-bg": surfaces.bg,
      "--color-surface-card": surfaces.card,
      "--color-surface-border": surfaces.border,
      "--color-surface-50": surfaces.surface50,
      "--color-surface-100": surfaces.surface100,
      "--color-surface-200": surfaces.surface200,
      "--color-surface-300": surfaces.surface300,
      "--color-text-primary": "#f8fafc",
      "--color-text-secondary": "#cbd5e1",
      "--color-text-muted": "#94a3b8",
    };
  } else {
    // Light Mode
    if (palette.lightSurface?.bg) {
      surfaces = {
        bg: palette.lightSurface.bg,
        card: palette.lightSurface.card || "#ffffff",
        border: palette.lightSurface.border || "#e2e8f0",
        surface50: palette.lightSurface.surface50 || "#f8fafc",
        surface100: palette.lightSurface.surface100 || "#f1f5f9",
        surface200: palette.lightSurface.surface200 || "#e2e8f0",
        surface300: palette.lightSurface.surface300 || "#cbd5e1",
      };
    } else {
      const { r, g, b } = hexToRgb(palette.primary);
      surfaces = {
        bg: `rgb(${Math.min(255, Math.round(250 + r * 0.02))}, ${Math.min(255, Math.round(250 + g * 0.02))}, ${Math.min(255, Math.round(250 + b * 0.02))})`,
        card: "#ffffff",
        border: `rgba(${r}, ${g}, ${b}, 0.15)`,
        surface50: `rgba(${r}, ${g}, ${b}, 0.04)`,
        surface100: `rgba(${r}, ${g}, ${b}, 0.08)`,
        surface200: `rgba(${r}, ${g}, ${b}, 0.14)`,
        surface300: `rgba(${r}, ${g}, ${b}, 0.20)`,
      };
    }

    return {
      "--color-primary-50": "#f5f3ff",
      "--color-primary-100": "#ede9fe",
      "--color-primary-200": "#ddd6fe",
      "--color-primary-300": "#c4b5fd",
      "--color-primary-400": palette.primaryLight || palette.primary,
      "--color-primary-500": palette.primary,
      "--color-primary-600": palette.primaryDark || palette.primary,
      "--color-primary-700": palette.primaryDark || "#431407",
      "--color-primary-800": "#2e1065",
      "--color-primary-900": "#1e0b47",
      "--color-surface-bg": surfaces.bg,
      "--color-surface-card": surfaces.card,
      "--color-surface-border": surfaces.border,
      "--color-surface-50": surfaces.surface50,
      "--color-surface-100": surfaces.surface100,
      "--color-surface-200": surfaces.surface200,
      "--color-surface-300": surfaces.surface300,
      "--color-text-primary": "#0f172a",
      "--color-text-secondary": "#334155",
      "--color-text-muted": "#64748b",
    };
  }
}
