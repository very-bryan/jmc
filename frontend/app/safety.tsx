import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../src/hooks/useThemeColors";

const GUIDELINES = [
  {
    icon: "person-search",
    title: "프로필을 꼼꼼히 확인하세요",
    desc: "만남 전에 상대방의 프로필, 인증 상태, 게시글을 꼼꼼히 확인하세요. 인증 뱃지가 있는 회원은 본인확인이 완료된 회원입니다.",
  },
  {
    icon: "location-on",
    title: "첫 만남은 공공장소에서",
    desc: "처음 만나는 상대와는 반드시 카페, 식당 등 공공장소에서 만나세요. 사람이 많은 시간대를 선택하는 것이 좋습니다.",
  },
  {
    icon: "money-off",
    title: "금전 요청에 응하지 마세요",
    desc: "어떤 이유로든 금전을 요청하는 상대는 의심하세요. 투자, 대출, 긴급 상황 등을 이유로 돈을 요구하면 즉시 신고해주세요.",
  },
  {
    icon: "share-location",
    title: "지인에게 만남 정보를 공유하세요",
    desc: "오프라인 만남 시 만나는 장소, 시간, 상대방 정보를 가까운 지인에게 미리 알려두세요.",
  },
  {
    icon: "block",
    title: "불쾌한 행동은 즉시 차단/신고",
    desc: "성적 메시지, 욕설, 스토킹 등 불쾌한 행동을 하는 상대는 즉시 차단하고 신고해주세요. 운영팀이 24시간 내에 조치합니다.",
  },
  {
    icon: "no-photography",
    title: "개인정보를 쉽게 공유하지 마세요",
    desc: "주소, 직장 위치, SNS 계정 등 개인정보는 충분히 신뢰가 쌓인 후에 공유하세요. 사진도 신중하게 공유하세요.",
  },
  {
    icon: "local-bar",
    title: "음주는 적당히",
    desc: "첫 만남에서 과도한 음주는 피하세요. 판단력이 흐려지면 안전하지 못한 상황이 발생할 수 있습니다.",
  },
  {
    icon: "report",
    title: "위험을 느끼면 즉시 대처하세요",
    desc: "위험하다고 느끼면 자리를 피하고 112에 신고하세요. 진만추 운영팀도 support@jmc-app.com으로 연락해주세요.",
  },
];

export default function SafetyScreen() {
  const router = useRouter();
  const C = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: C.text }]}>안전 가이드라인</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroBanner, { backgroundColor: C.primaryLight }]}>
          <MaterialIcons name="shield" size={28} color={C.primary} />
          <Text style={[styles.heroText, { color: C.primary }]}>
            안전한 만남을 위한 가이드
          </Text>
          <Text style={[styles.heroDesc, { color: C.textSecondary }]}>
            진만추는 회원님의 안전을 최우선으로 합니다
          </Text>
        </View>

        {GUIDELINES.map((item, i) => (
          <View key={i} style={[styles.guideCard, { backgroundColor: C.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: C.primaryLight }]}>
              <MaterialIcons name={item.icon as any} size={22} color={C.primary} />
            </View>
            <View style={styles.guideContent}>
              <Text style={[styles.guideTitle, { color: C.text }]}>{item.title}</Text>
              <Text style={[styles.guideDesc, { color: C.textSecondary }]}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.emergencySection}>
          <Text style={[styles.emergencyTitle, { color: C.error }]}>긴급 상황 시</Text>
          <Text style={[styles.emergencyNumber, { color: C.text }]}>경찰 112 | 여성긴급전화 1366</Text>
          <Text style={[styles.emergencyEmail, { color: C.textSecondary }]}>
            진만추 운영팀: support@jmc-app.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  topTitle: { fontSize: 18, fontWeight: "700" },
  content: { padding: 20 },
  heroBanner: {
    borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 20, gap: 6,
  },
  heroText: { fontSize: 17, fontWeight: "800" },
  heroDesc: { fontSize: 13 },
  guideCard: {
    flexDirection: "row", borderRadius: 14, padding: 16, marginBottom: 12, gap: 14,
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center",
  },
  guideContent: { flex: 1 },
  guideTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  guideDesc: { fontSize: 13, lineHeight: 20 },
  emergencySection: { alignItems: "center", paddingVertical: 30 },
  emergencyTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  emergencyNumber: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  emergencyEmail: { fontSize: 13 },
});
