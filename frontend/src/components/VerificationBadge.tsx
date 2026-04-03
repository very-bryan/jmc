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

interface OrgBadgeProps {
  type: "company" | "university";
  name?: string | null;
  size?: "small" | "medium";
}

export function OrgBadge({ type, name, size = "small" }: OrgBadgeProps) {
  const isCompany = type === "company";
  const label = name || (isCompany ? "직장 인증" : "학교 인증");
  const bgColor = isCompany ? "#EFF6FF" : "#F0FDF4";
  const textColor = isCompany ? "#1D4ED8" : "#15803D";
  const borderColor = isCompany ? "#BFDBFE" : "#BBF7D0";

  return (
    <View
      style={[
        styles.orgBadge,
        { backgroundColor: bgColor, borderColor },
        size === "medium" && styles.orgMedium,
      ]}
    >
      <Text
        style={[
          styles.orgText,
          { color: textColor },
          size === "medium" && styles.orgMediumText,
        ]}
      >
        {label}
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
  orgBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  orgMedium: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  orgText: {
    fontSize: 10,
    fontWeight: "600",
  },
  orgMediumText: {
    fontSize: 12,
  },
});
