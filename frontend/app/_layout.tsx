import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { useAuthStore } from "../src/store/authStore";
import { useThemeStore } from "../src/store/themeStore";
import { useIsDark, useThemeColors } from "../src/hooks/useThemeColors";

export default function RootLayout() {
  const loadToken = useAuthStore((s) => s.loadToken);
  const loadMode = useThemeStore((s) => s.loadMode);
  const isDark = useIsDark();
  const C = useThemeColors();

  useEffect(() => {
    loadToken();
    loadMode();
  }, []);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: C.background,
      card: C.background,
      text: C.text,
      border: C.border,
      primary: C.primary,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.background },
        animation: "fade",
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="graduation/index" options={{ headerShown: false }} />
        <Stack.Screen name="graduation/pending" options={{ headerShown: false }} />
        <Stack.Screen name="graduation/complete" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
