import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useIsDark } from "../hooks/useThemeColors";

const { width } = Dimensions.get("window");

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function OnboardingLayout({ children, scrollable = true }: Props) {
  const isDark = useIsDark();

  const gradientColors = isDark
    ? ["#1A1520", "#1C1828", "#1A1822", "#1E1A28"] as const
    : ["#E8E0F0", "#F5F1EA", "#F0E8E0", "#EDE8F5"] as const;

  const decoColor1 = isDark ? "rgba(156,134,255,0.15)" : "#C9BFFF";
  const decoColor2 = isDark ? "rgba(229,192,176,0.1)" : "#E5C0B0";
  const decoOpacity1 = isDark ? 1 : 0.5;
  const decoOpacity2 = isDark ? 1 : 0.35;

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.inner}>{children}</View>
  );

  return (
    <LinearGradient
      colors={gradientColors as any}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      <View style={[styles.deco1, { backgroundColor: decoColor1, opacity: decoOpacity1 }]} />
      <View style={[styles.deco2, { backgroundColor: decoColor2, opacity: decoOpacity2 }]} />
      {content}
    </LinearGradient>
  );
}

export function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const isDark = useIsDark();

  const glassColors = isDark
    ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"] as const
    : ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.15)"] as const;

  const borderTop = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.5)";
  const borderLeft = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.3)";
  const borderBottom = isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.08)";

  return (
    <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={[styles.glassOuter, style]}>
      <LinearGradient
        colors={glassColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.glassInner, {
          borderTopColor: borderTop,
          borderLeftColor: borderLeft,
          borderBottomColor: borderBottom,
          borderRightColor: borderBottom,
        }]}
      >
        {children}
      </LinearGradient>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 20, paddingBottom: 40 },
  inner: { flex: 1, padding: 24 },
  deco1: {
    position: "absolute", top: 60, left: -30,
    width: 120, height: 120, borderRadius: 60,
  },
  deco2: {
    position: "absolute", top: 300, right: -40,
    width: 140, height: 140, borderRadius: 70,
  },
  glassOuter: {
    borderRadius: 24, overflow: "hidden", marginBottom: 20,
  },
  glassInner: {
    padding: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderRadius: 24,
  },
});
