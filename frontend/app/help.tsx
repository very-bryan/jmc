import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../src/hooks/useThemeColors";

const FAQ = [
  { q: "진만추는 어떤 서비스인가요?", a: "진만추(진지한 만남 추구)는 진지한 연애와 결혼을 원하는 26-35세를 위한 매칭 서비스입니다. 검증된 회원만 참여할 수 있습니다." },
  { q: "가입은 어떻게 하나요?", a: "초대코드를 받거나 10,000원 가입비를 결제하면 가입할 수 있습니다. 가입 후 프로필을 작성하면 2개의 초대코드가 발급됩니다." },
  { q: "매칭은 어떻게 이루어지나요?", a: "피드에서 관심 있는 상대에게 '관심 보내기'를 하면, 상대방도 관심을 보내면 상호 관심이 성립되어 대화할 수 있습니다." },
  { q: "졸업이란 무엇인가요?", a: "좋은 사람을 만나 진만추를 떠나는 것을 '졸업'이라고 합니다. 졸업 신청 시 상대방의 수락이 필요하며, 졸업하면 계정이 비활성화됩니다." },
  { q: "프로필을 비활성화하면 어떻게 되나요?", a: "비활성화하면 다른 회원에게 프로필이 표시되지 않습니다. 다시 로그인하면 자동으로 활성화됩니다." },
  { q: "차단한 상대를 해제할 수 있나요?", a: "현재 앱 내에서 차단 해제 기능은 준비 중입니다. 고객센터로 문의해주세요." },
  { q: "신고는 어떻게 처리되나요?", a: "신고 접수 후 24시간 이내에 운영팀이 검토합니다. 허위 프로필, 부적절한 행동 등은 경고 또는 영구정지 처분됩니다." },
];

export default function HelpScreen() {
  const router = useRouter();
  const C = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: C.text }]}>도움말 센터</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>자주 묻는 질문</Text>

        {FAQ.map((item, i) => (
          <View key={i} style={[styles.faqCard, { backgroundColor: C.surface }]}>
            <Text style={[styles.question, { color: C.text }]}>{item.q}</Text>
            <Text style={[styles.answer, { color: C.textSecondary }]}>{item.a}</Text>
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, { color: C.text }]}>더 궁금한 점이 있으신가요?</Text>
          <Text style={[styles.contactEmail, { color: C.primary }]}>support@jmc-app.com</Text>
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
  subtitle: { fontSize: 14, marginBottom: 16 },
  faqCard: {
    borderRadius: 14, padding: 18, marginBottom: 12,
  },
  question: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  answer: { fontSize: 14, lineHeight: 21 },
  contactSection: { alignItems: "center", paddingVertical: 30 },
  contactTitle: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  contactEmail: { fontSize: 16, fontWeight: "700" },
});
