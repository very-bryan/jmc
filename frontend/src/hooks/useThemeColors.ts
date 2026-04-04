import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/themeStore";

const LIGHT = {
  primary: "#9C86FF",
  primaryLight: "#EDE8FF",
  primaryDark: "#7B68CC",
  primaryGradientEnd: "#B8A5FF",
  background: "#FFFFFF",
  surface: "#f4f7f9",
  surfaceCard: "#FFFFFF",
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#EEEFF2",
  borderLight: "#F5F5F8",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  accent: "#9C86FF",
  accentLight: "#F3F0FF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray800: "#1F2937",
  badgeBlue: "#3B82F6",
  badgeGreen: "#10B981",
  badgeGold: "#F59E0B",
  badgeGray: "#9CA3AF",
};

const DARK = {
  primary: "#A994FF",
  primaryLight: "#2A2440",
  primaryDark: "#7B68CC",
  primaryGradientEnd: "#B8A5FF",
  background: "#121218",
  surface: "#1C1C24",
  surfaceCard: "#1C1C24",
  text: "#F0F0F5",
  textSecondary: "#9CA3AF",
  textLight: "#6B7280",
  border: "#2A2A35",
  borderLight: "#22222C",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  accent: "#A994FF",
  accentLight: "#2A2440",
  gray50: "#1C1C24",
  gray100: "#22222C",
  gray200: "#2A2A35",
  gray800: "#E5E7EB",
  badgeBlue: "#60A5FA",
  badgeGreen: "#34D399",
  badgeGold: "#FBBF24",
  badgeGray: "#6B7280",
};

export type ThemeColors = typeof LIGHT;

function useResolvedDark(): boolean {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  if (mode === "light") return false;
  if (mode === "dark") return true;
  return systemScheme === "dark";
}

export function useThemeColors(): ThemeColors {
  const isDark = useResolvedDark();
  return isDark ? DARK : LIGHT;
}

export function useIsDark(): boolean {
  return useResolvedDark();
}
