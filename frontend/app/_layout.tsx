import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/authStore";
import { useThemeStore } from "../src/store/themeStore";
import { useIsDark } from "../src/hooks/useThemeColors";

export default function RootLayout() {
  const loadToken = useAuthStore((s) => s.loadToken);
  const loadMode = useThemeStore((s) => s.loadMode);
  const isDark = useIsDark();

  useEffect(() => {
    loadToken();
    loadMode();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="graduation/index" options={{ headerShown: false }} />
        <Stack.Screen name="graduation/pending" options={{ headerShown: false }} />
        <Stack.Screen name="graduation/complete" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
