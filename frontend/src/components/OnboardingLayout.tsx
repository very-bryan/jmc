import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function OnboardingLayout({ children, scrollable = true }: Props) {
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
      colors={["#E8E0F0", "#F5F1EA", "#F0E8E0", "#EDE8F5"]}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      <View style={styles.deco1} />
      <View style={styles.deco2} />
      {content}
    </LinearGradient>
  );
}

export function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <BlurView intensity={40} tint="light" style={[styles.glassOuter, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0.15)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassInner}
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
    backgroundColor: "#C9BFFF", opacity: 0.5,
  },
  deco2: {
    position: "absolute", top: 300, right: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: "#E5C0B0", opacity: 0.35,
  },
  glassOuter: {
    borderRadius: 24, overflow: "hidden", marginBottom: 20,
  },
  glassInner: {
    padding: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: "rgba(255,255,255,0.5)",
    borderLeftColor: "rgba(255,255,255,0.3)",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderRightColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
  },
});
