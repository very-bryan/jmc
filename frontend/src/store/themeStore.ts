import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  loadMode: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",

  setMode: async (mode: ThemeMode) => {
    await AsyncStorage.setItem("theme_mode", mode);
    set({ mode });
  },

  loadMode: async () => {
    try {
      const saved = await AsyncStorage.getItem("theme_mode");
      if (saved === "light" || saved === "dark" || saved === "system") {
        set({ mode: saved });
      }
    } catch {}
  },
}));
