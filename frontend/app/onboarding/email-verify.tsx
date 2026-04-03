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
import client from "../../src/api/client";
import { trackEvent } from "../../src/api/analytics";
import { useAuthStore } from "../../src/store/authStore";
import { COLORS } from "../../src/constants/config";

export default function EmailVerifyScreen() {
  const router = useRouter();
  const { fetchMe } = useAuthStore();
  const [step, setStep] = useState<"input" | "code">("input");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgResult, setOrgResult] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!email.includes("@")) {
      Alert.alert("오류", "올바른 이메일을 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      const res = await client.post("/auth/verify_work_email", {
        email,
        organization_name: orgName || undefined,
      });
      setOrgResult(res.data.organization_name);
      trackEvent("work_email_submit", { domain: email.split("@")[1] });
      setStep("code");
    } catch (err: any) {
      Alert.alert("오류", err.response?.data?.error || "인증 요청에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await client.post("/auth/confirm_work_email", { token: code });
      trackEvent("work_email_verified");
      await fetchMe();
      Alert.alert("인증 완료!", `${orgResult || email.split("@")[1]} 인증이 완료되었습니다`, [
        { text: "확인", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch {
      Alert.alert("오류", "인증코드가 일치하지 않습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    trackEvent("work_email_skip");
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>선택사항</Text>
      </View>

      <Text style={styles.title}>
        {step === "input" ? "직장/학교 인증" : "인증코드 입력"}
      </Text>

      {step === "input" ? (
        <>
          <View style={styles.promoBox}>
            <Text style={styles.promoTitle}>인증하면 데이트 성공률이 올라갑니다!</Text>
            <Text style={styles.promoDesc}>
              직장 또는 학교 메일을 인증하면 프로필에 신뢰 배지가 표시되어{"\n"}
              상대방에게 더 높은 신뢰를 줄 수 있어요
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>직장/학교 이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="name@company.com"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Text style={styles.hint}>
              gmail, naver 등 개인 메일은 사용할 수 없어요
            </Text>

            <Text style={[styles.label, { marginTop: 16 }]}>회사/학교 이름 (선택)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 삼성전자, 서울대학교"
              placeholderTextColor={COLORS.textLight}
              value={orgName}
              onChangeText={setOrgName}
            />
            <Text style={styles.hint}>
              입력하시면 더 정확한 인증이 가능해요
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, !email && styles.btnDisabled]}
              onPress={handleSendCode}
              disabled={loading || !email}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "발송 중..." : "인증 메일 받기"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.form}>
          {orgResult && (
            <View style={styles.orgBadge}>
              <Text style={styles.orgBadgeText}>{orgResult}</Text>
            </View>
          )}

          <Text style={styles.desc}>
            {email}로 인증코드를 발송했습니다
          </Text>

          <TextInput
            style={styles.codeInput}
            placeholder="ABC123"
            placeholderTextColor={COLORS.textLight}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
            autoFocus
          />

          <TouchableOpacity
            style={[styles.primaryBtn, code.length < 6 && styles.btnDisabled]}
            onPress={handleVerifyCode}
            disabled={loading || code.length < 6}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? "확인 중..." : "인증 완료"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>나중에 할게요</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  badgeText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 16,
  },
  promoBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  promoTitle: { fontSize: 15, fontWeight: "700", color: "#0369A1", marginBottom: 6 },
  promoDesc: { fontSize: 13, color: "#0C4A6E", lineHeight: 20 },
  form: {},
  label: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  hint: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  btnDisabled: { backgroundColor: COLORS.textLight },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  desc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: "center" },
  codeInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: 8,
    fontWeight: "700",
  },
  orgBadge: {
    alignSelf: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
  },
  orgBadgeText: { fontSize: 14, fontWeight: "700", color: "#065F46" },
  skipBtn: { marginTop: 16, alignItems: "center", paddingVertical: 12 },
  skipText: { fontSize: 14, color: COLORS.textLight },
});
