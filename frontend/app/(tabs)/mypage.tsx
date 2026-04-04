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
import { useThemeStore, ThemeMode } from "../../src/store/themeStore";
import { inviteCodeApi } from "../../src/api";
import client from "../../src/api/client";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { VerificationBadge } from "../../src/components/VerificationBadge";
import { useThemeColors } from "../../src/hooks/useThemeColors";

export default function MypageScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const { user, logout, fetchMe } = useAuthStore();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
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
    } catch {}
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
    <ScrollView style={[styles.container, { backgroundColor: C.surface }]}>
      <View style={[styles.profileSection, { backgroundColor: C.background }]}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={[styles.avatarImage, { backgroundColor: C.surface }]} />
          <View style={[styles.profileBadge, { backgroundColor: C.badgeBlue, borderColor: C.background }]}>
            <MaterialIcons name="verified" size={14} color="#fff" />
          </View>
        </View>
        <View style={styles.nameRow}>
          <Text style={[styles.nickname, { color: C.text }]}>{user.nickname}</Text>
          <VerificationBadge level={user.verification_level} size="medium" />
        </View>
        <Text style={[styles.premiumText, { color: C.textSecondary }]}>가입일 2023년</Text>
      </View>

      <View style={[styles.gradCard, { backgroundColor: C.primary }]}>
        <Text style={styles.gradTitle}>좋은 사람을 만나셨나요?</Text>
        <Text style={styles.gradSubtitle}>졸업은 진만추의 축하입니다</Text>
        <TouchableOpacity style={styles.gradBtn} onPress={() => Alert.alert("준비 중입니다")}>
          <Text style={[styles.gradBtnText, { color: C.primary }]}>졸업 신청</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: C.textLight }]}>계정</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <SettingsRow icon="person" label="개인정보" onPress={() => router.push("/onboarding/profile")} C={C} />
        <SettingsRow icon="mail" label="이메일 · 전화번호" onPress={() => router.push("/onboarding/email-verify")} C={C} />
        <SettingsRow icon="credit-card" label="구독 · 결제" badge="[미구현]" isLast C={C} />
      </View>

      <Text style={[styles.sectionLabel, { color: C.textLight }]}>매칭 설정</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <SettingsRow icon="tune" label="검색 필터" onPress={() => router.push("/onboarding/preference")} C={C} />
        <SettingsRow icon="favorite" label="관계 가치관" onPress={() => router.push("/onboarding/survey")} isLast C={C} />
      </View>

      <Text style={[styles.sectionLabel, { color: C.textLight }]}>화면</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <View style={[styles.themeRow, { borderBottomColor: C.borderLight }]}>
          <MaterialIcons name="dark-mode" size={20} color={C.textSecondary} style={{ width: 28 }} />
          <Text style={[styles.rowLabel, { color: C.text }]}>화면 모드</Text>
        </View>
        <View style={[styles.themeOptions, { borderBottomColor: C.borderLight }]}>
          {([
            { key: "system" as ThemeMode, label: "시스템 설정" },
            { key: "light" as ThemeMode, label: "라이트" },
            { key: "dark" as ThemeMode, label: "다크" },
          ]).map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.themeOption, { backgroundColor: themeMode === opt.key ? C.primary : C.surface }]}
              onPress={() => setThemeMode(opt.key)}
            >
              <Text style={[styles.themeOptionText, { color: themeMode === opt.key ? "#fff" : C.textSecondary }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: C.textLight }]}>알림</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <View style={[styles.settingsRow, { borderBottomColor: C.borderLight }]}>
          <MaterialIcons name="notifications" size={20} color={C.textSecondary} style={{ width: 28 }} />
          <Text style={[styles.rowLabel, { color: C.text }]}>푸시 알림</Text>
          <Switch
            value={true}
            trackColor={{ true: C.primary, false: C.border }}
          />
        </View>
        <SettingsRow icon="schedule" label="방해금지 모드" badge="[미구현]" isLast C={C} />
      </View>

      <Text style={[styles.sectionLabel, { color: C.textLight }]}>개인정보 · 계정 관리</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <SettingsRow icon="visibility" label="프로필 공개 설정" badge="[미구현]" C={C} />
        <SettingsRow icon="warning" label="프로필 비활성화" badge="[미구현]" isLast C={C} />
      </View>

      <Text style={[styles.sectionLabel, { color: C.textLight }]}>고객지원</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <SettingsRow icon="help" label="도움말 센터" badge="[미구현]" C={C} />
        <SettingsRow icon="verified-user" label="안전 가이드라인" badge="[미구현]" isLast C={C} />
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
        <Text style={[styles.signOutText, { color: C.error }]}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: C.textLight }]}>버전 1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SettingsRow({
  icon,
  label,
  isLast,
  onPress,
  badge,
  C,
}: {
  icon: string;
  label: string;
  isLast?: boolean;
  onPress?: () => void;
  badge?: string;
  C: any;
}) {
  return (
    <TouchableOpacity style={[styles.settingsRow, { borderBottomColor: C.borderLight }, isLast && styles.settingsRowLast]} onPress={onPress}>
      <MaterialIcons name={icon as any} size={20} color={C.textSecondary} style={{ width: 28 }} />
      <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
      {badge && <Text style={[styles.notImplBadge, { color: C.textLight }]}>{badge}</Text>}
      <MaterialIcons name="chevron-right" size={22} color={C.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileSection: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    marginBottom: 14, position: "relative",
  },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  profileBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  nickname: { fontSize: 22, fontWeight: "700" },
  premiumText: { fontSize: 13, marginTop: 2 },
  gradCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  gradTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 4 },
  gradSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 14, textAlign: "center" },
  gradBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 28, paddingVertical: 10, borderRadius: 12,
  },
  gradBtnText: { fontSize: 14, fontWeight: "700" },
  sectionLabel: {
    fontSize: 12, fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 24, marginBottom: 8, marginLeft: 20,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingsRowLast: { borderBottomWidth: 0 },
  rowLabel: { flex: 1, fontSize: 15, marginLeft: 8 },
  notImplBadge: { fontSize: 11, marginRight: 4 },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  themeOptions: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  signOutBtn: { marginTop: 30, alignItems: "center", paddingVertical: 14 },
  signOutText: { fontSize: 14, fontWeight: "700", letterSpacing: 1 },
  versionText: { textAlign: "center", fontSize: 12, marginTop: 8 },
});
