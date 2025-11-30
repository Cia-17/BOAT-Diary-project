/**
 * Theme definitions for the journal app
 */

export type Theme = {
  id: string;
  name: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  card: string;
  gradient: string;
};

export const themes: Theme[] = [
  {
    id: "sunset",
    name: "Sunset Dreams",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    primary: "#667eea",
    secondary: "#764ba2",
    accent: "#f093fb",
    text: "#ffffff",
    card: "rgba(255, 255, 255, 0.1)",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    accent: "#22d3ee",
    text: "#ffffff",
    card: "rgba(255, 255, 255, 0.1)",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "forest",
    name: "Forest Green",
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    primary: "#11998e",
    secondary: "#38ef7d",
    accent: "#a8e6cf",
    text: "#ffffff",
    card: "rgba(255, 255, 255, 0.1)",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "warm",
    name: "Warm Embrace",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    primary: "#f5576c",
    secondary: "#f093fb",
    accent: "#ffecd2",
    text: "#ffffff",
    card: "rgba(255, 255, 255, 0.1)",
    gradient: "from-pink-500 to-red-500",
  },
  {
    id: "golden",
    name: "Golden Hour",
    background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    primary: "#fda085",
    secondary: "#f6d365",
    accent: "#ffeaa7",
    text: "#2d3436",
    card: "rgba(255, 255, 255, 0.9)",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    id: "lavender",
    name: "Lavender Fields",
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    primary: "#a8edea",
    secondary: "#fed6e3",
    accent: "#d299c2",
    text: "#2d3436",
    card: "rgba(255, 255, 255, 0.9)",
    gradient: "from-cyan-200 to-pink-200",
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    primary: "#34495e",
    secondary: "#2c3e50",
    accent: "#3498db",
    text: "#ffffff",
    card: "rgba(255, 255, 255, 0.1)",
    gradient: "from-slate-700 to-slate-900",
  },
  {
    id: "spring",
    name: "Spring Bloom",
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    primary: "#fa709a",
    secondary: "#fee140",
    accent: "#ffecd2",
    text: "#2d3436",
    card: "rgba(255, 255, 255, 0.9)",
    gradient: "from-pink-400 to-yellow-300",
  },
];

export function getTheme(themeId: string): Theme {
  return themes.find((t) => t.id === themeId) || themes[0];
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--theme-background", theme.background);
  root.style.setProperty("--theme-primary", theme.primary);
  root.style.setProperty("--theme-secondary", theme.secondary);
  root.style.setProperty("--theme-accent", theme.accent);
  root.style.setProperty("--theme-text", theme.text);
  root.style.setProperty("--theme-card", theme.card);
}

