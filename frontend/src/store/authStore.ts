import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/auth";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  loadToken: () => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setToken: async (token: string) => {
    await AsyncStorage.setItem("auth_token", token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user: User) => {
    set({ user });
  },

  loadToken: async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        set({ token, isAuthenticated: true });
        await get().fetchMe();
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMe: async () => {
    try {
      const res = await authApi.me();
      set({ user: res.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false, token: null });
      await AsyncStorage.removeItem("auth_token");
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("auth_token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
