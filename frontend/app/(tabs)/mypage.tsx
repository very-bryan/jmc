import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Share,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/authStore";
import { ConfirmModal, ResultToast } from "../../src/components/ConfirmModal";
import { useThemeStore, ThemeMode } from "../../src/store/themeStore";
import { inviteCodeApi, profileApi } from "../../src/api";
import { authApi } from "../../src/api/auth";
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
  const [logoutModal, setLogoutModal] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

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

  const handleLogout = () => setLogoutModal(true);

  const confirmLogout = async () => {
    setLogoutModal(false);
    await logout();
    while (router.canGoBack()) {
      router.back();
    }
    router.replace("/");
  };

  const handleDeactivate = async () => {
    setDeactivateModal(false);
    try {
      await authApi.deactivate();
      setToastType("success");
      setToastMsg("계정이 비활성화되었습니다");
      setTimeout(async () => {
        await logout();
        router.replace("/");
      }, 1500);
    } catch {
      setToastType("error");
      setToastMsg("비활성화에 실패했습니다");
    }
  };

  const toggleProfileVisibility = async (value: boolean) => {
    setProfileVisible(value);
    try {
      await profileApi.update({ status: value ? "active" : "dormant" } as any);
      await fetchMe();
    } catch {
      setProfileVisible(!value);
      setToastType("error");
      setToastMsg("설정 변경에 실패했습니다");
    }
  };

  if (!user) return null;

  const avatarUri =
    user.profile_image_url ||
    `https://i.pravatar.cc/150?img=${(user.id ?? 1) % 10 + 1}`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.surface }]}>
      {/* Profile Section */}
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

      {/* Graduation Card */}
      <View style={[styles.gradCard, { backgroundColor: C.primary }]}>
        <Text style={styles.gradTitle}>좋은 사람을 만나셨나요?</Text>
        <Text style={styles.gradSubtitle}>졸업은 진만추의 축하입니다</Text>
        <TouchableOpacity style={styles.gradBtn} onPress={() => router.push("/graduation" as any)}>
          <Text style={[styles.gradBtnText, { color: C.primary }]}>졸업 신청</Text>
        </TouchableOpacity>
      </View>

      {/* 계정 */}
      <Text style={[styles.sectionLabel, { color: C.textLight }]}>계정</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <SettingsRow icon="person" label="개인정보" onPress={() => router.push("/onboarding/profile")} C={C} />
        <SettingsRow icon="mail" label="이메일 · 전화번호" onPress={() => router.push("/onboarding/email-verify")} C={C} />
        <SettingsRow icon="credit-card" label="구독 · 결제" badge="준비 중" isLast C={C} />
      </View>

      {/* 매칭 설정 */}
      <Text style={[styles.sectionLabel, { color: C.textLight }]}>매칭 설정</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <SettingsRow icon="tune" label="검색 필터" onPress={() => router.push("/onboarding/preference")} C={C} />
        <SettingsRow icon="favorite" label="관계 가치관" onPress={() => router.push("/onboarding/survey")} C={C} />
        <SettingsRow icon="psychology" label="MBTI 설정" onPress={() => router.push("/onboarding/mbti" as any)} isLast C={C} />
      </View>

      {/* 화면 */}
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

      {/* 알림 */}
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
        <View style={[styles.settingsRow, styles.settingsRowLast]}>
          <MaterialIcons name="schedule" size={20} color={C.textSecondary} style={{ width: 28 }} />
          <Text style={[styles.rowLabel, { color: C.text }]}>방해금지 모드</Text>
          <Switch
            value={dndEnabled}
            onValueChange={setDndEnabled}
            trackColor={{ true: C.primary, false: C.border }}
          />
        </View>
      </View>
      {dndEnabled && (
        <Text style={[styles.dndHint, { color: C.textLight }]}>
          22:00 ~ 08:00 사이 알림을 받지 않습니다
        </Text>
      )}

      {/* 개인정보 · 계정 관리 */}
      <Text style={[styles.sectionLabel, { color: C.textLight }]}>개인정보 · 계정 관리</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <View style={[styles.settingsRow, { borderBottomColor: C.borderLight }]}>
          <MaterialIcons name="visibility" size={20} color={C.textSecondary} style={{ width: 28 }} />
          <Text style={[styles.rowLabel, { color: C.text }]}>프로필 공개</Text>
          <Switch
            value={profileVisible}
            onValueChange={toggleProfileVisibility}
            trackColor={{ true: C.primary, false: C.border }}
          />
        </View>
        <TouchableOpacity
          style={[styles.settingsRow, styles.settingsRowLast]}
          onPress={() => setDeactivateModal(true)}
        >
          <MaterialIcons name="warning" size={20} color={C.error} style={{ width: 28 }} />
          <Text style={[styles.rowLabel, { color: C.error }]}>프로필 비활성화</Text>
          <MaterialIcons name="chevron-right" size={22} color={C.textLight} />
        </TouchableOpacity>
      </View>

      {/* 고객지원 */}
      <Text style={[styles.sectionLabel, { color: C.textLight }]}>고객지원</Text>
      <View style={[styles.card, { backgroundColor: C.background }]}>
        <SettingsRow icon="help" label="도움말 센터" onPress={() => router.push("/help" as any)} C={C} />
        <SettingsRow icon="verified-user" label="안전 가이드라인" onPress={() => router.push("/safety" as any)} isLast C={C} />
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
        <Text style={[styles.signOutText, { color: C.error }]}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: C.textLight }]}>버전 1.0.0</Text>
      <View style={{ height: 40 }} />

      <ConfirmModal
        visible={logoutModal}
        icon="logout"
        iconColor={C.error}
        title="정말 로그아웃하시겠습니까?"
        confirmText="로그아웃"
        confirmColor={C.error}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModal(false)}
      />
      <ConfirmModal
        visible={deactivateModal}
        icon="warning"
        iconColor={C.error}
        title="프로필을 비활성화하시겠습니까?"
        message={"비활성화하면 다른 회원에게 프로필이\n표시되지 않습니다.\n다시 활성화하려면 재로그인이 필요합니다."}
        confirmText="비활성화"
        confirmColor={C.error}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateModal(false)}
      />
      <ResultToast visible={!!toastMsg} message={toastMsg} type={toastType} onDone={() => setToastMsg("")} />
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
  dndHint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 20,
  },
  signOutBtn: { marginTop: 30, alignItems: "center", paddingVertical: 14 },
  signOutText: { fontSize: 14, fontWeight: "700", letterSpacing: 1 },
  versionText: { textAlign: "center", fontSize: 12, marginTop: 8 },
});
