import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,

} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authApi } from "../../src/api/auth";
import { useAuthStore } from "../../src/store/authStore";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { OnboardingLayout, GlassCard } from "../../src/components/OnboardingLayout";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { ResultToast } from "../../src/components/ConfirmModal";

const GENDERS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const MARRIAGE_TIMINGS = [
  { value: "within_1_year", label: "1년 이내" },
  { value: "within_3_years", label: "1~3년" },
  { value: "within_5_years", label: "3~5년" },
  { value: "undecided", label: "미정" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = getStyles(C);
  const { phone, invite_code, payment_token, is_seed } = useLocalSearchParams<{
    phone: string;
    invite_code?: string;
    payment_token?: string;
    is_seed?: string;
  }>();
  const { setToken, setUser, user, token } = useAuthStore();
  const isExistingUser = !!token;

  const [form, setForm] = useState({
    nickname: user?.nickname || "",
    gender: user?.gender || "",
    birth_year: user?.birth_year?.toString() || "",
    region: user?.region || "",
    occupation: user?.occupation || "",
    desired_marriage_timing: user?.desired_marriage_timing || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    form.nickname && form.gender && form.birth_year && form.region &&
    form.occupation && form.desired_marriage_timing && (isExistingUser || form.password);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isExistingUser) {
        // 기존 유저: 프로필 업데이트
        const { profileApi } = require("../../src/api");
        const res = await profileApi.update({
          nickname: form.nickname,
          gender: form.gender,
          birth_year: parseInt(form.birth_year),
          region: form.region,
          occupation: form.occupation,
          desired_marriage_timing: form.desired_marriage_timing,
        });
        setUser(res.data.user);
      } else {
        // 새 유저: 회원가입
        const res = await authApi.register({
          user: {
            phone: phone || user?.phone || "",
            password: form.password,
            nickname: form.nickname,
            gender: form.gender,
            birth_year: parseInt(form.birth_year),
            region: form.region,
            occupation: form.occupation,
            desired_marriage_timing: form.desired_marriage_timing,
          },
          invite_code: invite_code || undefined,
          payment_token: payment_token || undefined,
          is_seed: is_seed === "true" ? true : undefined,
        });
        await setToken(res.data.token);
        setUser(res.data.user);
      }
      trackEvent(EVENTS.PROFILE_COMPLETE, { gender: form.gender, region: form.region });
      router.push("/onboarding/survey");
    } catch (err: any) {
      const msg = err.response?.data?.errors?.join("\n") || err.response?.data?.error || err.message || "가입에 실패했습니다";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout scrollable={true}>
      <Text style={styles.title}>기본 프로필</Text>
      <Text style={styles.subtitle}>진지한 만남을 위한 기본 정보를 입력해주세요</Text>

      <GlassCard>
        <Text style={styles.label}>닉네임 *</Text>
        <TextInput
          style={styles.input}
          placeholder="2~20자"
          placeholderTextColor={C.textLight}
          value={form.nickname}
          onChangeText={(v) => updateField("nickname", v)}
          maxLength={20}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>비밀번호 *</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor={C.textLight}
          secureTextEntry
          value={form.password}
          onChangeText={(v) => updateField("password", v)}
        />
      </GlassCard>

      <GlassCard>
        <Text style={styles.label}>성별 *</Text>
        <View style={styles.chipRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.chip, form.gender === g.value && styles.chipActive]}
              onPress={() => updateField("gender", g.value)}
            >
              <Text style={[styles.chipText, form.gender === g.value && styles.chipTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>출생연도 *</Text>
        <TextInput
          style={styles.input}
          placeholder="1995"
          placeholderTextColor={C.textLight}
          keyboardType="number-pad"
          maxLength={4}
          value={form.birth_year}
          onChangeText={(v) => updateField("birth_year", v)}
        />
      </GlassCard>

      <GlassCard>
        <Text style={styles.label}>지역 *</Text>
        <View style={styles.chipRow}>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, form.region === r && styles.chipActive]}
              onPress={() => updateField("region", r)}
            >
              <Text style={[styles.chipText, form.region === r && styles.chipTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.label}>직업군 *</Text>
        <TextInput
          style={styles.input}
          placeholder="예: IT/개발, 금융, 의료 등"
          placeholderTextColor={C.textLight}
          value={form.occupation}
          onChangeText={(v) => updateField("occupation", v)}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>결혼 희망 시기 *</Text>
        <View style={styles.chipRow}>
          {MARRIAGE_TIMINGS.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, form.desired_marriage_timing === t.value && styles.chipActive]}
              onPress={() => updateField("desired_marriage_timing", t.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  form.desired_marriage_timing === t.value && styles.chipTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      <TouchableOpacity
        style={[styles.button, !isValid && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading || !isValid}
      >
        <Text style={styles.buttonText}>
          {loading ? "가입 중..." : "다음"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      <ResultToast visible={!!errorMsg} message={errorMsg} type="error" onDone={() => setErrorMsg("")} />
    </OnboardingLayout>
  );
}

const getStyles = (C: any) => StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: C.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.textSecondary, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: C.text, marginBottom: 8 },
  input: {
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
  },
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
    marginTop: 12,
  },
  buttonDisabled: { backgroundColor: C.textLight },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
