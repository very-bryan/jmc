import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { inviteCodeApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { COLORS } from "../../src/constants/config";

export default function InviteScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const res = await inviteCodeApi.validate(code.trim());
      if (res.data.valid) {
        trackEvent("invite_code_used", { code: code.trim() });
        router.push({
          pathname: "/onboarding/profile",
          params: { phone, invite_code: code.trim().toUpperCase() },
        });
      } else {
        Alert.alert("오류", res.data.error || "유효하지 않은 초대코드입니다");
      }
    } catch {
      Alert.alert("오류", "확인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    // TODO: 토스페이먼츠 결제 연동
    // 지금은 결제 완료로 바로 진행
    trackEvent("signup_payment", { amount: 10000 });
    router.push({
      pathname: "/onboarding/profile",
      params: { phone, payment_token: "mock_payment" },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>가입 방법 선택</Text>
      <Text style={styles.subtitle}>
        초대코드가 있으면 무료로, 없으면 10,000원으로 가입할 수 있습니다
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>초대코드 입력</Text>
        <TextInput
          style={styles.codeInput}
          placeholder="ABC123"
          placeholderTextColor={COLORS.textLight}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, code.length < 6 && styles.btnDisabled]}
          onPress={handleValidate}
          disabled={loading || code.length < 6}
        >
          <Text style={styles.primaryBtnText}>
            {loading ? "확인 중..." : "초대코드로 무료 가입"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
        <Text style={styles.payBtnText}>10,000원 결제하고 가입</Text>
        <Text style={styles.payBtnSub}>초대코드가 없어도 가입할 수 있어요</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 20,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
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
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: COLORS.textLight },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: COLORS.textLight,
  },
  payBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  payBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  payBtnSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
});
