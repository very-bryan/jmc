import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { inviteCodeApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { VerificationBadge } from "../../src/components/VerificationBadge";
import { COLORS } from "../../src/constants/config";

export default function MypageScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.nickname?.charAt(0) || "?"}
          </Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <VerificationBadge level={user.verification_level} size="medium" />
        </View>
        <Text style={styles.meta}>
          {user.age}세 · {user.region} · {user.occupation}
        </Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>인증 상태</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>본인확인</Text>
          <Text style={[styles.rowValue, user.phone_verified && styles.verified]}>
            {user.phone_verified ? "완료" : "미완료"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>셀피 인증</Text>
          <Text style={[styles.rowValue, user.selfie_verified && styles.verified]}>
            {user.selfie_verified ? "완료" : "미완료"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>프로필 완성</Text>
          <Text style={[styles.rowValue, user.profile_completed && styles.verified]}>
            {user.profile_completed ? "완료" : "미완료"}
          </Text>
        </View>
      </View>

      {inviteCodes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>초대코드</Text>
          <Text style={styles.inviteDesc}>
            친구를 초대하면 무료로 가입할 수 있어요
          </Text>
          {inviteCodes.map((c) => (
            <View key={c.id} style={styles.codeRow}>
              <View style={styles.codeInfo}>
                <Text style={[styles.codeText, c.status !== "available" && styles.codeUsed]}>
                  {c.code}
                </Text>
                {c.status === "used" && c.used_by && (
                  <Text style={styles.codeUsedBy}>
                    {c.used_by.nickname}님이 사용
                  </Text>
                )}
              </View>
              {c.status === "available" ? (
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => handleShare(c.code)}
                >
                  <Text style={styles.shareBtnText}>공유</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.usedBadge}>사용됨</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>
        <MenuItem label="프로필 편집" onPress={() => {}} />
        <MenuItem label="관심 조건 수정" onPress={() => {}} />
        <MenuItem label="차단 목록" onPress={() => {}} />
        <MenuItem label="신고 내역" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>관계</Text>
        <MenuItem label="연애 중 설정" onPress={() => {}} />
        <MenuItem label="졸업 신청" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  profileSection: {
    backgroundColor: COLORS.background,
    alignItems: "center",
    padding: 24,
    paddingTop: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "600", color: COLORS.textSecondary },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  nickname: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  meta: { fontSize: 14, color: COLORS.textSecondary },
  bio: { fontSize: 14, color: COLORS.text, marginTop: 8, textAlign: "center" },
  section: {
    backgroundColor: COLORS.background,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowLabel: { fontSize: 14, color: COLORS.textSecondary },
  rowValue: { fontSize: 14, color: COLORS.textLight },
  verified: { color: COLORS.success, fontWeight: "600" },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLabel: { fontSize: 15, color: COLORS.text },
  menuArrow: { fontSize: 20, color: COLORS.textLight },
  logoutBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutText: { fontSize: 15, color: COLORS.error, fontWeight: "600" },
  inviteDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  codeInfo: { flex: 1 },
  codeText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 3,
  },
  codeUsed: { color: COLORS.textLight },
  codeUsedBy: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  shareBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  usedBadge: { fontSize: 12, color: COLORS.textLight },
});
