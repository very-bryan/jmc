import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { userApi, interestApi, blockApi, reportApi, relationshipApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { ConfirmModal, ResultToast } from "../../src/components/ConfirmModal";
import { MbtiCompatBadge } from "../../src/components/MbtiCompatBadge";
import { useThemeColors, useIsDark } from "../../src/hooks/useThemeColors";

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
  const C = useThemeColors();
  const isDark = useIsDark();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [gradModal, setGradModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [gradSubmitting, setGradSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const [errorMsg, setErrorMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await userApi.get(Number(id));
      setProfile(res.data.user);
      trackEvent(EVENTS.PROFILE_VIEW, { target_user_id: Number(id) });
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        setErrorMsg("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else if (status === 403) {
        setErrorMsg("접근할 수 없는 프로필입니다.");
      } else if (status === 404) {
        setErrorMsg("프로필을 찾을 수 없습니다.");
      } else {
        setErrorMsg("프로필을 불러오는데 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async () => {
    try {
      await interestApi.create(Number(id));
      trackEvent(EVENTS.INTEREST_SEND, { target_user_id: Number(id), source: "profile" });
      setToastMsg("관심을 보냈습니다!");
    } catch (err: any) {
      setToastMsg(err.response?.data?.errors?.[0] || "관심 보내기에 실패했습니다");
    }
  };

  const handleBlock = () => setBlockModal(true);
  const handleReport = () => setReportModal(true);

  const confirmBlock = async () => {
    setBlockModal(false);
    try {
      await blockApi.create(Number(id));
      trackEvent(EVENTS.BLOCK_USER, { target_user_id: Number(id) });
      setToastMsg("차단되었습니다");
    } catch {
      setToastMsg("차단에 실패했습니다");
    }
  };

  const handleGraduation = async () => {
    setGradModal(false);
    setGradSubmitting(true);
    try {
      await relationshipApi.create(Number(id), "graduated");
      trackEvent(EVENTS.GRADUATION_REQUEST, { partner_id: Number(id) });
      router.replace({
        pathname: "/graduation/pending",
        params: { nickname: profile?.nickname },
      } as any);
    } catch {
      setGradSubmitting(false);
      setToastMsg("졸업 신청에 실패했습니다");
    }
  };

  const confirmReport = async () => {
    setReportModal(false);
    try {
      await reportApi.create({
        reported_id: Number(id),
        reportable_type: "User",
        reportable_id: Number(id),
        report_type: "other",
        reason: "사용자 신고",
      });
      trackEvent(EVENTS.REPORT_SUBMIT, { target_user_id: Number(id), report_type: "other" });
      setToastMsg("신고가 접수되었습니다");
    } catch {
      setToastMsg("신고 접수에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ConfirmModal
          visible={true}
          icon="error-outline"
          iconColor={C.textSecondary}
          title={errorMsg || "프로필을 찾을 수 없습니다"}
          confirmText="돌아가기"
          cancelText=""
          onConfirm={() => router.back()}
          onCancel={() => router.back()}
        />
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
    <View style={[styles.wrapper, { backgroundColor: C.surface }]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Photo */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: avatarUri }} style={styles.heroImage} />
          {/* Top buttons overlay */}
          <View style={styles.heroOverlay}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={22} color={C.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.graduateBtn} onPress={() => setGradModal(true)}>
              <Text style={styles.graduateBtnText}>{profile.nickname}님과 졸업</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name & Info */}
        <View style={[styles.infoSection, { backgroundColor: C.background }]}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: C.text }]}>{profile.nickname}, {profile.age}</Text>
            {profile.verification_level !== "basic" && (
              <MaterialIcons name="verified" size={28} color={C.primary} />
            )}
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="work-outline" size={16} color={C.textSecondary} />
            <Text style={[styles.metaText, { color: C.textSecondary }]}>{profile.occupation || "직업 미등록"}</Text>
            <Text style={[styles.metaDot, { color: C.textLight }]}>·</Text>
            <MaterialIcons name="location-on" size={16} color={C.textSecondary} />
            <Text style={[styles.metaText, { color: C.textSecondary }]}>{profile.region}</Text>
          </View>
          {profile.mbti && (
            <View style={{ marginTop: 10 }}>
              <MbtiCompatBadge
                mbti={profile.mbti}
                compatibility={profile.mbti_compatibility}
                size="medium"
              />
            </View>
          )}
          {profile.bio && <Text style={[styles.bioText, { color: C.text }]}>{profile.bio}</Text>}
        </View>

        {/* My Taste */}
        <View style={[styles.section, { backgroundColor: C.background }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>취향</Text>
          <View style={styles.tagsWrap}>
            {DUMMY_TASTES.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: C.primaryLight }]}>
                <Text style={[styles.tagText, { color: C.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Deep Dive */}
        <View style={[styles.section, { backgroundColor: C.background }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>더 알아보기</Text>
          {DUMMY_DEEP_DIVE.map((item, i) => (
            <View key={i} style={[styles.deepDiveCard, { backgroundColor: C.surface }]}>
              <Text style={[styles.deepDiveQ, { color: C.text }]}>{item.q}</Text>
              <Text style={[styles.deepDiveA, { color: C.textSecondary }]}>"{item.a}"</Text>
            </View>
          ))}
        </View>

        {/* Value Survey */}
        {survey && (
          <View style={[styles.section, { backgroundColor: C.background }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>가치관</Text>
            <View style={styles.valuesGrid}>
              {survey.marriage_intention && (
                <ValueChip C={C} label="결혼" value={LABELS[survey.marriage_intention] || survey.marriage_intention} />
              )}
              {survey.children_plan && (
                <ValueChip C={C} label="자녀" value={LABELS[survey.children_plan] || survey.children_plan} />
              )}
              {survey.lifestyle_pattern && (
                <ValueChip C={C} label="생활" value={LABELS[survey.lifestyle_pattern] || survey.lifestyle_pattern} />
              )}
              {survey.relationship_style && (
                <ValueChip C={C} label="관계" value={LABELS[survey.relationship_style] || survey.relationship_style} />
              )}
              {survey.religion && (
                <ValueChip C={C} label="종교" value={survey.religion} />
              )}
            </View>
          </View>
        )}

        {/* Recent Posts */}
        {profile.recent_posts?.length > 0 && (
          <View style={[styles.section, { backgroundColor: C.background }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>최근 게시글</Text>
            {profile.recent_posts.map((p: any, i: number) => (
              <View key={p.id} style={[styles.postCard, { borderBottomColor: C.border }]}>
                <Image
                  source={{ uri: `https://picsum.photos/400/400?random=${p.id || i}` }}
                  style={[styles.postThumb, { backgroundColor: C.surface }]}
                />
                <View style={styles.postContent}>
                  <Text style={[styles.postText, { color: C.text }]} numberOfLines={2}>{p.content}</Text>
                  {p.mood_tag && <Text style={[styles.postTag, { color: C.primary }]}>#{p.mood_tag}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sub Actions */}
        <View style={[styles.subActions, { backgroundColor: C.background }]}>
          <TouchableOpacity onPress={handleBlock}>
            <Text style={[styles.subActionText, { color: C.textSecondary }]}>차단</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReport}>
            <Text style={[styles.subActionText, { color: C.primary }]}>신고</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Connect */}
      <View style={[styles.bottomBar, { backgroundColor: isDark ? "rgba(18,18,24,0.95)" : "rgba(255,255,255,0.95)", borderTopColor: C.border }]}>
        <TouchableOpacity style={[styles.connectBtn, { backgroundColor: C.primary }]} onPress={handleInterest}>
          <MaterialIcons name="favorite-border" size={20} color="#fff" />
          <Text style={styles.connectText}>관심 보내기</Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={reportModal}
        icon="flag"
        iconColor={C.error}
        title="이 사용자를 신고하시겠습니까?"
        message="허위 신고 시 제재를 받을 수 있습니다"
        confirmText="신고"
        confirmColor={C.error}
        onConfirm={confirmReport}
        onCancel={() => setReportModal(false)}
      />
      <ConfirmModal
        visible={blockModal}
        icon="block"
        iconColor={C.textSecondary}
        title="이 사용자를 차단하시겠습니까?"
        message="차단하면 서로의 게시글과 프로필을 볼 수 없습니다"
        confirmText="차단"
        confirmColor={C.error}
        onConfirm={confirmBlock}
        onCancel={() => setBlockModal(false)}
      />
      <ResultToast
        visible={!!toastMsg}
        message={toastMsg}
        onDone={() => setToastMsg("")}
      />
      <ConfirmModal
        visible={gradModal}
        icon="school"
        iconColor={C.primary}
        title={`${profile?.nickname}님에게\n졸업을 신청하시겠습니까?`}
        message={"상대방이 수락하면 졸업이 완료됩니다.\n졸업 시 계정이 비활성화되며\n다른 회원에게 프로필이 표시되지 않습니다.\n다시 활성화하려면 휴면해제가 필요합니다."}
        confirmText="졸업 신청"
        onConfirm={handleGraduation}
        onCancel={() => setGradModal(false)}
      />
    </View>
  );
}

function ValueChip({ label, value, C }: { label: string; value: string; C: any }) {
  return (
    <View style={[styles.valueChip, { backgroundColor: C.surface }]}>
      <Text style={[styles.valueChipLabel, { color: C.textLight }]}>{label}</Text>
      <Text style={[styles.valueChipValue, { color: C.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16 },
  heroWrap: { position: "relative" },
  heroImage: { width: width, height: width * 0.85 },
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
  infoSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nameText: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  metaText: { fontSize: 14 },
  metaDot: { fontSize: 14, marginHorizontal: 4 },
  bioText: { fontSize: 14, lineHeight: 21, marginTop: 12 },
  section: { paddingHorizontal: 20, paddingVertical: 20, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 14 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: "600" },
  deepDiveCard: { borderRadius: 16, padding: 18, marginBottom: 10 },
  deepDiveQ: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  deepDiveA: { fontSize: 14, lineHeight: 21, fontStyle: "italic" },
  valuesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  valueChip: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  valueChipLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", marginBottom: 2 },
  valueChipValue: { fontSize: 14, fontWeight: "600" },
  postCard: { flexDirection: "row", gap: 12, paddingVertical: 10, borderBottomWidth: 0.5 },
  postThumb: { width: 60, height: 60, borderRadius: 10 },
  postContent: { flex: 1, justifyContent: "center" },
  postText: { fontSize: 13, lineHeight: 19 },
  postTag: { fontSize: 12, marginTop: 3 },
  subActions: {
    flexDirection: "row", justifyContent: "center", gap: 32,
    paddingVertical: 20, marginTop: 8,
  },
  subActionText: { fontSize: 14 },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 30,
    borderTopWidth: 0.5,
  },
  connectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 14,
  },
  connectText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
