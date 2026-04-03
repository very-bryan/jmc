import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { userApi, interestApi, blockApi, reportApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { VerificationBadge } from "../../src/components/VerificationBadge";
import { COLORS } from "../../src/constants/config";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userApi.get(Number(id));
      setProfile(res.data.user);
      trackEvent(EVENTS.PROFILE_VIEW, { target_user_id: Number(id) });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async () => {
    try {
      await interestApi.create(Number(id));
      trackEvent(EVENTS.INTEREST_SEND, { target_user_id: Number(id), source: "profile" });
      Alert.alert("완료", "관심을 보냈습니다!");
    } catch (err: any) {
      Alert.alert("알림", err.response?.data?.errors?.[0] || "관심 보내기에 실패했습니다");
    }
  };

  const handleBlock = () => {
    Alert.alert("차단", "이 사용자를 차단하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: async () => {
          try {
            await blockApi.create(Number(id));
            trackEvent(EVENTS.BLOCK_USER, { target_user_id: Number(id) });
            Alert.alert("완료", "차단되었습니다");
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  const handleReport = () => {
    Alert.alert("신고", "이 사용자를 신고하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "신고",
        style: "destructive",
        onPress: async () => {
          try {
            await reportApi.create({
              reported_id: Number(id),
              reportable_type: "User",
              reportable_id: Number(id),
              report_type: "other",
              reason: "사용자 신고",
            });
            trackEvent(EVENTS.REPORT_SUBMIT, { target_user_id: Number(id), report_type: "other" });
            Alert.alert("완료", "신고가 접수되었습니다");
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>프로필을 찾을 수 없습니다</Text>
      </View>
    );
  }

  const survey = profile.value_survey;
  const LABELS: Record<string, string> = {
    very_willing: "매우 희망", willing: "희망", open: "열린 마음", undecided: "미정",
    want_children: "원함", open_to_children: "열린 마음", no_children: "원하지 않음",
    early_bird: "아침형", night_owl: "저녁형", flexible: "유연함",
    independent: "독립적", balanced_together: "균형", very_close: "밀착형",
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.nickname?.charAt(0) || "?"}
          </Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.nickname}>{profile.nickname}</Text>
          <VerificationBadge level={profile.verification_level} size="medium" />
        </View>
        <Text style={styles.meta}>
          {profile.age}세 · {profile.region} · {profile.occupation}
        </Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      {survey && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가치관</Text>
          <InfoRow label="결혼 의향" value={LABELS[survey.marriage_intention] || survey.marriage_intention} />
          <InfoRow label="자녀 계획" value={LABELS[survey.children_plan] || survey.children_plan} />
          {survey.religion && <InfoRow label="종교" value={survey.religion} />}
          <InfoRow label="생활 패턴" value={LABELS[survey.lifestyle_pattern] || survey.lifestyle_pattern} />
          <InfoRow label="관계 성향" value={LABELS[survey.relationship_style] || survey.relationship_style} />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>생활 정보</Text>
        <InfoRow label="결혼 희망 시기" value={profile.desired_marriage_timing} />
        {profile.smoking && <InfoRow label="흡연" value={profile.smoking} />}
        {profile.drinking && <InfoRow label="음주" value={profile.drinking} />}
      </View>

      {profile.recent_posts?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 게시글</Text>
          {profile.recent_posts.map((p: any) => (
            <View key={p.id} style={styles.postPreview}>
              <Text style={styles.postContent}>{p.content}</Text>
              {p.mood_tag && <Text style={styles.postTag}>#{p.mood_tag}</Text>}
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.interestBtn} onPress={handleInterest}>
          <Text style={styles.interestBtnText}>관심 보내기</Text>
        </TouchableOpacity>

        <View style={styles.subActions}>
          <TouchableOpacity onPress={handleBlock}>
            <Text style={styles.subActionText}>차단</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReport}>
            <Text style={[styles.subActionText, { color: COLORS.error }]}>신고</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: COLORS.textSecondary },
  header: {
    backgroundColor: COLORS.background,
    alignItems: "center",
    padding: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: "600", color: COLORS.textSecondary },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  nickname: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  meta: { fontSize: 14, color: COLORS.textSecondary },
  bio: { fontSize: 14, color: COLORS.text, marginTop: 10, textAlign: "center", lineHeight: 20 },
  section: {
    backgroundColor: COLORS.background,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  postPreview: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postContent: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  postTag: { fontSize: 13, color: COLORS.primary, marginTop: 4 },
  actions: {
    backgroundColor: COLORS.background,
    marginTop: 8,
    padding: 20,
  },
  interestBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  interestBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  subActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginTop: 16,
  },
  subActionText: { fontSize: 14, color: COLORS.textSecondary },
});
