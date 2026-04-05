import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COMPATIBILITY_COLORS } from "../constants/mbti";

interface Props {
  mbti?: string | null;
  compatibility?: {
    score: number;
    label: string;
    color: string;
  } | null;
  size?: "small" | "medium";
}

export function MbtiCompatBadge({ mbti, compatibility, size = "small" }: Props) {
  if (!mbti) return null;

  const isSmall = size === "small";

  return (
    <View style={styles.row}>
      <View style={[styles.mbtiBadge, isSmall && styles.mbtiBadgeSmall]}>
        <Text style={[styles.mbtiText, isSmall && styles.mbtiTextSmall]}>{mbti}</Text>
      </View>
      {compatibility && (
        <View style={[
          styles.compatBadge,
          isSmall && styles.compatBadgeSmall,
          { backgroundColor: COMPATIBILITY_COLORS[compatibility.color] || "#9CA3AF" },
        ]}>
          <Text style={[styles.compatText, isSmall && styles.compatTextSmall]}>
            {compatibility.label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  mbtiBadge: {
    backgroundColor: "rgba(156,134,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mbtiBadgeSmall: { paddingHorizontal: 6, paddingVertical: 2 },
  mbtiText: { fontSize: 11, fontWeight: "700", color: "#9C86FF" },
  mbtiTextSmall: { fontSize: 10 },
  compatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compatBadgeSmall: { paddingHorizontal: 6, paddingVertical: 2 },
  compatText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  compatTextSmall: { fontSize: 10 },
});
