import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { VERIFICATION_BADGES } from "../constants/config";

interface Props {
  level: string;
  size?: "small" | "medium";
}

export function VerificationBadge({ level, size = "small" }: Props) {
  const badge = VERIFICATION_BADGES[level] || VERIFICATION_BADGES.basic;

  return (
    <View style={[styles.badge, { backgroundColor: badge.color }, size === "medium" && styles.medium]}>
      <Text style={[styles.text, size === "medium" && styles.mediumText]}>
        {badge.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  mediumText: {
    fontSize: 12,
  },
});
