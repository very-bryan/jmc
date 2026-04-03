export const API_BASE_URL = "https://jmc-backend.verycloud.io";

export const API_URL = `${API_BASE_URL}/api/v1`;

export const COLORS = {
  primary: "#FF6B6B",
  primaryLight: "#FFE0E0",
  primaryDark: "#E85555",
  background: "#FFFFFF",
  surface: "#F5F5F8",
  surfaceCard: "#FFFFFF",
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#EEEFF2",
  borderLight: "#F5F5F8",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  coral: "#FF6B6B",
  coralLight: "#FFF0F0",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray800: "#1F2937",
  badgeBlue: "#3B82F6",
  badgeGreen: "#10B981",
  badgeGold: "#F59E0B",
  badgeGray: "#9CA3AF",
};

export const VERIFICATION_BADGES: Record<string, { color: string; label: string }> = {
  basic: { color: COLORS.badgeGray, label: "기본" },
  phone_verified: { color: COLORS.badgeBlue, label: "본인확인" },
  selfie_verified: { color: COLORS.badgeGreen, label: "얼굴확인" },
  profile_verified: { color: COLORS.badgeGreen, label: "프로필확인" },
  fully_verified: { color: COLORS.badgeGold, label: "신뢰확인" },
};
