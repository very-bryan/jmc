import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,

} from "react-native";
import { useRouter } from "expo-router";
import { valueSurveyApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { OnboardingLayout, GlassCard } from "../../src/components/OnboardingLayout";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { ResultToast } from "../../src/components/ConfirmModal";

const QUESTIONS = [
  {
    key: "marriage_intention",
    title: "결혼 의향",
    options: [
      { value: "very_willing", label: "매우 희망" },
      { value: "willing", label: "희망" },
      { value: "open", label: "열린 마음" },
      { value: "undecided", label: "미정" },
    ],
  },
  {
    key: "children_plan",
    title: "자녀 계획",
    options: [
      { value: "want_children", label: "원함" },
      { value: "open_to_children", label: "열린 마음" },
      { value: "no_children", label: "원하지 않음" },
      { value: "undecided_children", label: "미정" },
    ],
  },
  {
    key: "lifestyle_pattern",
    title: "생활 패턴",
    options: [
      { value: "early_bird", label: "아침형" },
      { value: "night_owl", label: "저녁형" },
      { value: "flexible", label: "유연함" },
    ],
  },
  {
    key: "spending_tendency",
    title: "소비 성향",
    options: [
      { value: "frugal", label: "절약형" },
      { value: "balanced", label: "균형형" },
      { value: "generous", label: "소비형" },
    ],
  },
  {
    key: "relationship_style",
    title: "관계 성향",
    options: [
      { value: "independent", label: "독립적" },
      { value: "balanced_together", label: "균형" },
      { value: "very_close", label: "밀착형" },
    ],
  },
  {
    key: "conflict_resolution",
    title: "갈등 해결 방식",
    options: [
      { value: "discussion", label: "대화" },
      { value: "compromise", label: "타협" },
      { value: "space_first", label: "거리두기" },
      { value: "mediator", label: "중재자" },
    ],
  },
];

export default function SurveyScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = getStyles(C);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isValid = answers.marriage_intention && answers.children_plan;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await valueSurveyApi.create(answers);
      trackEvent(EVENTS.SURVEY_COMPLETE);
      router.push("/onboarding/preference");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.join("\n") || "저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout scrollable={true}>
      <Text style={styles.title}>가치관 설문</Text>
      <Text style={styles.subtitle}>
        상대방과의 가치관 적합도를 파악하기 위한 설문입니다
      </Text>

      {QUESTIONS.map((q) => (
        <GlassCard key={q.key}>
          <Text style={styles.questionTitle}>{q.title}</Text>
          <View style={styles.chipRow}>
            {q.options.map((o) => (
              <TouchableOpacity
                key={o.value}
                style={[styles.chip, answers[q.key] === o.value && styles.chipActive]}
                onPress={() => setAnswers((prev) => ({ ...prev, [q.key]: o.value }))}
              >
                <Text
                  style={[styles.chipText, answers[q.key] === o.value && styles.chipTextActive]}
                >
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>
      ))}

      <TouchableOpacity
        style={[styles.button, !isValid && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading || !isValid}
      >
        <Text style={styles.buttonText}>{loading ? "저장 중..." : "다음"}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      <ResultToast visible={!!errorMsg} message={errorMsg} type="error" onDone={() => setErrorMsg("")} />
    </OnboardingLayout>
  );
}

const getStyles = (C: any) => StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: C.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.textSecondary, marginBottom: 24 },
  questionTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
  },
  chipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  chipText: { fontSize: 13, color: C.textSecondary },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  button: {
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { backgroundColor: C.textLight },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
