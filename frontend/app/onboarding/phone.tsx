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
import { useRouter } from "expo-router";
import { authApi } from "../../src/api/auth";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { OnboardingLayout, GlassCard } from "../../src/components/OnboardingLayout";
import { ResultToast } from "../../src/components/ConfirmModal";
import { useThemeColors } from "../../src/hooks/useThemeColors";

export default function PhoneScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = getStyles(C);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRequestCode = async () => {
    if (phone.length < 10) {
      setErrorMsg("유효한 전화번호를 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      await authApi.requestCode(phone);
      trackEvent(EVENTS.PHONE_VERIFY_REQUEST);
      router.push({ pathname: "/onboarding/verify", params: { phone } });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "인증코드 발송에 실패했습니다";
      setErrorMsg(`${msg} (${err.response?.status || "network"})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout scrollable={false}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Text style={styles.title}>본인확인</Text>
        <Text style={styles.subtitle}>휴대폰 번호로 본인확인을 진행합니다</Text>

        <GlassCard>
          <Text style={styles.label}>휴대폰 번호</Text>
          <TextInput
            style={styles.input}
            placeholder="01012345678"
            placeholderTextColor={C.textLight}
            keyboardType="phone-pad"
            maxLength={11}
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity
            style={[styles.button, phone.length < 10 && styles.buttonDisabled]}
            onPress={handleRequestCode}
            disabled={loading || phone.length < 10}
          >
            <Text style={styles.buttonText}>{loading ? "발송 중..." : "인증코드 받기"}</Text>
          </TouchableOpacity>
        </GlassCard>
      </KeyboardAvoidingView>
      <ResultToast visible={!!errorMsg} message={errorMsg} type="error" onDone={() => setErrorMsg("")} />
    </OnboardingLayout>
  );
}

const getStyles = (C: any) => StyleSheet.create({
  content: { flex: 1, justifyContent: "flex-start", paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "800", color: C.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.textSecondary, marginBottom: 28 },
  label: { fontSize: 14, fontWeight: "600", color: C.text, marginBottom: 10 },
  input: {
    backgroundColor: C.surface,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, color: C.text, letterSpacing: 1, marginBottom: 20,
  },
  button: { backgroundColor: C.primary, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  buttonDisabled: { backgroundColor: C.textLight },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
