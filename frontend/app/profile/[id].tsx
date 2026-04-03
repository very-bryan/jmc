import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { userApi, interestApi, blockApi, reportApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { COLORS } from "../../src/constants/config";

const { width } = Dimensions.get("window");

// 더미 취향 태그
const DUMMY_TASTES = [
  "☕ 산미 없는 아메리카노",
  "🏃 주 3회 러닝",
  "🍷 내추럴 와인",
  "📸 필름 카메라",
  "🎧 인디 팝",
];

// 더미 Deep Dive
const DUMMY_DEEP_DIVE = [
  {
    q: "가장 완벽한 주말은?",
    a: "한강 근처 조용한 카페에서 디자인 책 읽고, 저녁엔 러닝 후 내추럴 와인 한 잔.",
  },
  {
    q: "요즘 만들려는 습관",
    a: "스누즈 안 누르고 6시에 일어나서 10분 명상하기.",
  },
];

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
          } catch {}
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
          } catch {}
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

  const profileImgId = (Number(id) % 10) + 1;
  const avatarUri = profile.profile_image_url || `https://i.pravatar.cc/600?img=${profileImgId}`;
  const survey = profile.value_survey;

  const LABELS: Record<string, string> = {
    very_willing: "매우 희망", willing: "희망", open: "열린 마음", undecided: "미정",
    want_children: "원함", open_to_children: "열린 마음", no_children: "원하지 않음",
    early_bird: "아침형", night_owl: "저녁형", flexible: "유연함",
    independent: "독립적", balanced_together: "균형", very_close: "밀착형",
    frugal: "절약형", balanced: "균형형", generous: "소비형",
    discussion: "대화", compromise: "타협", space_first: "거리두기",
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Photo */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: avatarUri }} style={styles.heroImage} />
          {/* Top buttons overlay */}
          <View style={styles.heroOverlay}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.graduateBtn}>
              <Text style={styles.graduateBtnText}>Graduate with {profile.nickname}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name & Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{profile.nickname}, {profile.age}</Text>
            {profile.verification_level !== "basic" && (
              <MaterialIcons name="verified" size={28} color={COLORS.primary} />
            )}
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="work-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{profile.occupation || "직업 미등록"}</Text>
            <Text style={styles.metaDot}>·</Text>
            <MaterialIcons name="location-on" size={16} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{profile.region}</Text>
          </View>
          {profile.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
        </View>

        {/* My Taste */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Taste</Text>
          <View style={styles.tagsWrap}>
            {DUMMY_TASTES.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Deep Dive */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deep Dive</Text>
          {DUMMY_DEEP_DIVE.map((item, i) => (
            <View key={i} style={styles.deepDiveCard}>
              <Text style={styles.deepDiveQ}>{item.q}</Text>
              <Text style={styles.deepDiveA}>"{item.a}"</Text>
            </View>
          ))}
        </View>

        {/* Value Survey */}
        {survey && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>가치관</Text>
            <View style={styles.valuesGrid}>
              {survey.marriage_intention && (
                <ValueChip label="결혼" value={LABELS[survey.marriage_intention] || survey.marriage_intention} />
              )}
              {survey.children_plan && (
                <ValueChip label="자녀" value={LABELS[survey.children_plan] || survey.children_plan} />
              )}
              {survey.lifestyle_pattern && (
                <ValueChip label="생활" value={LABELS[survey.lifestyle_pattern] || survey.lifestyle_pattern} />
              )}
              {survey.relationship_style && (
                <ValueChip label="관계" value={LABELS[survey.relationship_style] || survey.relationship_style} />
              )}
              {survey.religion && (
                <ValueChip label="종교" value={survey.religion} />
              )}
            </View>
          </View>
        )}

        {/* Recent Posts */}
        {profile.recent_posts?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>최근 게시글</Text>
            {profile.recent_posts.map((p: any, i: number) => (
              <View key={p.id} style={styles.postCard}>
                <Image
                  source={{ uri: `https://picsum.photos/400/400?random=${p.id || i}` }}
                  style={styles.postThumb}
                />
                <View style={styles.postContent}>
                  <Text style={styles.postText} numberOfLines={2}>{p.content}</Text>
                  {p.mood_tag && <Text style={styles.postTag}>#{p.mood_tag}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sub Actions */}
        <View style={styles.subActions}>
          <TouchableOpacity onPress={handleBlock}>
            <Text style={styles.subActionText}>차단</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReport}>
            <Text style={[styles.subActionText, { color: COLORS.primary }]}>신고</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Connect */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.connectBtn} onPress={handleInterest}>
          <MaterialIcons name="favorite-border" size={20} color="#fff" />
          <Text style={styles.connectText}>Connect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ValueChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.valueChip}>
      <Text style={styles.valueChipLabel}>{label}</Text>
      <Text style={styles.valueChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.surface },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: COLORS.textSecondary },

  // Hero
  heroWrap: { position: "relative" },
  heroImage: { width: width, height: width * 0.85, backgroundColor: COLORS.surface },
  heroOverlay: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 50, paddingHorizontal: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center", alignItems: "center",
  },
  graduateBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  graduateBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  // Name & Info
  infoSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: COLORS.background },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nameText: { fontSize: 28, fontWeight: "800", color: COLORS.text, letterSpacing: -0.5 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  metaText: { fontSize: 14, color: COLORS.textSecondary },
  metaDot: { fontSize: 14, color: COLORS.textLight, marginHorizontal: 4 },
  bioText: { fontSize: 14, color: COLORS.text, lineHeight: 21, marginTop: 12 },

  // Section
  section: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: COLORS.background, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 14 },

  // Tags
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  tagText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },

  // Deep Dive
  deepDiveCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 10,
  },
  deepDiveQ: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  deepDiveA: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, fontStyle: "italic" },

  // Values
  valuesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  valueChip: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  valueChipLabel: { fontSize: 10, fontWeight: "700", color: COLORS.textLight, textTransform: "uppercase", marginBottom: 2 },
  valueChipValue: { fontSize: 14, fontWeight: "600", color: COLORS.text },

  // Posts
  postCard: {
    flexDirection: "row", gap: 12, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  postThumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: COLORS.surface },
  postContent: { flex: 1, justifyContent: "center" },
  postText: { fontSize: 13, color: COLORS.text, lineHeight: 19 },
  postTag: { fontSize: 12, color: COLORS.primary, marginTop: 3 },

  // Sub Actions
  subActions: {
    flexDirection: "row", justifyContent: "center", gap: 32,
    paddingVertical: 20, backgroundColor: COLORS.background, marginTop: 8,
  },
  subActionText: { fontSize: 14, color: COLORS.textSecondary },

  // Bottom Bar
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 30,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
  },
  connectBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 14,
  },
  connectText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
