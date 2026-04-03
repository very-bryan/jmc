import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../src/constants/config";

const PRINCIPLES = [
  {
    title: "진지한 만남 전용",
    desc: "결혼 의향이 있는 분들을 위한 서비스입니다",
  },
  {
    title: "실명/본인확인 필수",
    desc: "가입 시 휴대폰 본인확인과 셀피 인증이 필요합니다",
  },
  {
    title: "상호 동의 후 대화",
    desc: "양쪽 모두 관심을 보내야 대화할 수 있습니다",
  },
  {
    title: "성혼 시 졸업",
    desc: "좋은 사람을 만나면 떠나는 것이 성공입니다",
  },
];

export default function IntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>서비스 철학</Text>
        <Text style={styles.subtitle}>
          진지한 관계를 원하는 분들을 위해{"\n"}
          만들어진 서비스입니다
        </Text>

        {PRINCIPLES.map((p, i) => (
          <View key={i} style={styles.principleCard}>
            <Text style={styles.principleNumber}>{i + 1}</Text>
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>{p.title}</Text>
              <Text style={styles.principleDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/onboarding/phone")}
        >
          <Text style={styles.buttonText}>동의하고 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, paddingTop: 80 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  principleCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  principleNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
    marginRight: 14,
    width: 28,
  },
  principleContent: { flex: 1 },
  principleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  principleDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bottom: { padding: 24, paddingBottom: 40 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
