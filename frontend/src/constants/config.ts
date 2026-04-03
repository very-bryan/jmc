export const API_BASE_URL = "https://jmc-backend.verycloud.io";

export const API_URL = `${API_BASE_URL}/api/v1`;

export const COLORS = {
  primary: "#4A90D9",
  secondary: "#7B61FF",
  accent: "#FF6B6B",
  background: "#FFFFFF",
  surface: "#F8F9FA",
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  badgeGray: "#9CA3AF",
  badgeBlue: "#3B82F6",
  badgeGreen: "#10B981",
  badgeGold: "#F59E0B",
};

export const VERIFICATION_BADGES: Record<string, { color: string; label: string }> = {
  basic: { color: COLORS.badgeGray, label: "기본" },
  phone_verified: { color: COLORS.badgeBlue, label: "본인확인" },
  selfie_verified: { color: COLORS.badgeGreen, label: "얼굴확인" },
  profile_verified: { color: COLORS.badgeGreen, label: "프로필확인" },
  fully_verified: { color: COLORS.badgeGold, label: "신뢰확인" },
};
