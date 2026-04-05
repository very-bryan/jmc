import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authApi } from "../../src/api/auth";
import { useAuthStore } from "../../src/store/authStore";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { ResultToast } from "../../src/components/ConfirmModal";
import { OnboardingLayout, GlassCard } from "../../src/components/OnboardingLayout";
import { COLORS } from "../../src/constants/config";

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await authApi.verifyCode(phone!, code);
      const data = res.data;

      if (data.is_new_user) {
        trackEvent(EVENTS.PHONE_VERIFY_COMPLETE, { is_new_user: 1 });
        router.push({ pathname: "/onboarding/invite", params: { phone } });
      } else {
        trackEvent(EVENTS.LOGIN_SUCCESS);
        await setToken(data.token!);
        setUser(data.user!);
        if (data.user!.profile_completed) {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding/profile");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "인증에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout scrollable={false}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Text style={styles.title}>인증코드 입력</Text>
        <Text style={styles.subtitle}>
          {phone}로 발송된 인증코드를 입력해주세요
        </Text>

        <GlassCard>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor={COLORS.textLight}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, code.length < 6 && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading || code.length < 6}
          >
            <Text style={styles.buttonText}>
              {loading ? "확인 중..." : "확인"}
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </KeyboardAvoidingView>
      <ResultToast visible={!!errorMsg} message={errorMsg} type="error" onDone={() => setErrorMsg("")} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "flex-start", paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28 },
  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: COLORS.textLight },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
