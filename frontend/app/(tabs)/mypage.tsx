import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Share,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/authStore";
import { inviteCodeApi } from "../../src/api";
import client from "../../src/api/client";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { VerificationBadge } from "../../src/components/VerificationBadge";
import { COLORS } from "../../src/constants/config";

export default function MypageScreen() {
  const router = useRouter();
  const { user, logout, fetchMe } = useAuthStore();
  const [inviteCodes, setInviteCodes] = useState<
    { id: number; code: string; status: string; used_by: any }[]
  >([]);

  useEffect(() => {
    inviteCodeApi.list().then((res) => setInviteCodes(res.data.codes)).catch(() => {});
  }, []);

  const handleShare = async (code: string) => {
    trackEvent("invite_code_share", { code });
    try {
      await Share.share({
        message: `진만추(진지한 만남 추구)에 초대합니다!\n\n초대코드: ${code}\n\n검증된 사람과 진지한 만남을 시작하세요.\nhttps://jmc-landing.verycloud.io`,
      });
    } catch {
      // 무시
    }
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  if (!user) return null;

  const avatarUri =
    user.profile_image_url ||
    `https://i.pravatar.cc/150?img=${(user.id ?? 1) % 10 + 1}`;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          <View style={styles.profileBadge}>
            <MaterialIcons name="verified" size={14} color="#fff" />
          </View>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <VerificationBadge level={user.verification_level} size="medium" />
        </View>
        <Text style={styles.premiumText}>가입일 2023년</Text>
      </View>

      {/* Graduation Card */}
      <View style={styles.gradCard}>
        <Text style={styles.gradTitle}>좋은 사람을 만나셨나요?</Text>
        <Text style={styles.gradSubtitle}>졸업은 진만추의 축하입니다</Text>
        <TouchableOpacity style={styles.gradBtn}>
          <Text style={styles.gradBtnText}>졸업 신청</Text>
        </TouchableOpacity>
      </View>

      {/* 계정 */}
      <Text style={styles.sectionLabel}>계정</Text>
      <View style={styles.card}>
        <SettingsRow icon="person" label="개인정보" />
        <SettingsRow icon="mail" label="이메일 · 전화번호" />
        <SettingsRow icon="credit-card" label="구독 · 결제" isLast />
      </View>

      {/* 매칭 설정 */}
      <Text style={styles.sectionLabel}>매칭 설정</Text>
      <View style={styles.card}>
        <SettingsRow icon="tune" label="검색 필터" />
        <SettingsRow icon="favorite" label="관계 가치관" isLast />
      </View>

      {/* 알림 */}
      <Text style={styles.sectionLabel}>알림</Text>
      <View style={styles.card}>
        <View style={styles.settingsRow}>
          <MaterialIcons name="notifications" size={20} color={COLORS.textSecondary} style={{ width: 28 }} />
          <Text style={styles.rowLabel}>푸시 알림</Text>
          <Switch
            value={true}
            trackColor={{ true: COLORS.primary, false: COLORS.border }}
          />
        </View>
        <SettingsRow icon="schedule" label="방해금지 모드" isLast />
      </View>

      {/* 개인정보 · 위험 구역 */}
      <Text style={styles.sectionLabel}>개인정보 · 계정 관리</Text>
      <View style={styles.card}>
        <SettingsRow icon="visibility" label="프로필 공개 설정" />
        <View style={[styles.settingsRow, styles.settingsRowLast]}>
          <MaterialIcons name="warning" size={20} color={COLORS.primary} style={{ width: 28 }} />
          <Text style={[styles.rowLabel, { color: COLORS.primary }]}>프로필 비활성화</Text>
          <View style={styles.tempBadge}>
            <Text style={styles.tempBadgeText}>임시</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.textLight} />
        </View>
      </View>

      {/* 고객지원 */}
      <Text style={styles.sectionLabel}>고객지원</Text>
      <View style={styles.card}>
        <SettingsRow icon="help" label="도움말 센터" />
        <SettingsRow icon="verified-user" label="안전 가이드라인" isLast />
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
        <Text style={styles.signOutText}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>버전 1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SettingsRow({
  icon,
  label,
  isLast,
}: {
  icon: string;
  label: string;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.settingsRow, isLast && styles.settingsRowLast]}>
      <MaterialIcons name={icon as any} size={20} color={COLORS.textSecondary} style={{ width: 28 }} />
      <Text style={styles.rowLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  profileSection: {
    backgroundColor: COLORS.background,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 14,
    position: "relative",
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surface,
  },
  profileBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.badgeBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  nickname: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  premiumText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Graduation card
  gradCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  gradTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  gradSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 14,
    textAlign: "center",
  },
  gradBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
  },
  gradBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 20,
  },

  // White card
  card: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  // Settings row
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    width: 28,
    textAlign: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 8,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textLight,
    fontWeight: "300",
  },

  // Temp badge
  tempBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  tempBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Sign out
  signOutBtn: {
    marginTop: 30,
    alignItems: "center",
    paddingVertical: 14,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.error,
    letterSpacing: 1,
  },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
  },
});
