import React, { useEffect } from "react";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/authStore";
import { trackPageView } from "../src/api/analytics";

export default function RootLayout() {
  const loadToken = useAuthStore((s) => s.loadToken);
  const pathname = usePathname();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: true, title: "프로필" }} />
      </Stack>
    </>
  );
}
