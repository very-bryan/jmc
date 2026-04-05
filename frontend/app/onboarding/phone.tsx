import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { authApi } from "../../src/api/auth";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { OnboardingLayout, GlassCard } from "../../src/components/OnboardingLayout";
import { COLORS } from "../../src/constants/config";

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
    if (phone.length < 10) {
      Alert.alert("오류", "유효한 전화번호를 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      await authApi.requestCode(phone);
      trackEvent(EVENTS.PHONE_VERIFY_REQUEST);
      router.push({ pathname: "/onboarding/verify", params: { phone } });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "인증코드 발송에 실패했습니다";
      Alert.alert("오류", `${msg} (${err.response?.status || "network"})`);
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
            placeholderTextColor={COLORS.textLight}
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
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "flex-start", paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 10 },
  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, color: COLORS.text, letterSpacing: 1, marginBottom: 20,
  },
  button: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  buttonDisabled: { backgroundColor: COLORS.textLight },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
