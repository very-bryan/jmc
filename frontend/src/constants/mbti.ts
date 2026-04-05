export const MBTI_TYPES = [
  "INFP", "ENFP", "INFJ", "ENFJ",
  "INTJ", "ENTJ", "INTP", "ENTP",
  "ISFP", "ESFP", "ISTP", "ESTP",
  "ISFJ", "ESFJ", "ISTJ", "ESTJ",
] as const;

export type MbtiType = (typeof MBTI_TYPES)[number];

export const MBTI_GROUPS: Record<string, MbtiType[]> = {
  "분석가 (NT)": ["INTJ", "INTP", "ENTJ", "ENTP"],
  "외교관 (NF)": ["INFJ", "INFP", "ENFJ", "ENFP"],
  "관리자 (SJ)": ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  "탐험가 (SP)": ["ISTP", "ISFP", "ESTP", "ESFP"],
};

export const COMPATIBILITY_COLORS: Record<string, string> = {
  blue: "#3B82F6",
  green: "#10B981",
  light_green: "#84CC16",
  yellow: "#F59E0B",
  red: "#EF4444",
};

export const COMPATIBILITY_LABELS: Record<string, string> = {
  blue: "최고",
  green: "좋음",
  light_green: "보통",
  yellow: "주의",
  red: "안맞음",
};
