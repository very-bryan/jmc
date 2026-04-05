import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { inviteCodeApi } from "../../src/api";
import { purchaseSignup } from "../../src/services/iap";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { OnboardingLayout, GlassCard } from "../../src/components/OnboardingLayout";
import { ResultToast } from "../../src/components/ConfirmModal";
import { COLORS } from "../../src/constants/config";

export default function InviteScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
        setErrorMsg(res.data.error || "유효하지 않은 초대코드입니다");
      }
    } catch {
      setErrorMsg("확인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await purchaseSignup();
      if (result.success) {
        trackEvent("signup_payment_complete", { amount: 10000 });
        router.push({
          pathname: "/onboarding/profile",
          params: { phone, payment_token: result.receipt || "iap_verified" },
        });
      } else {
        if (result.error !== "결제가 취소되었습니다") {
          setErrorMsg(result.error || "결제에 실패했습니다");
        }
      }
    } catch {
      setErrorMsg("결제 처리 중 문제가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout scrollable={false}>
      <View style={styles.content}>
        <Text style={styles.title}>가입 방법 선택</Text>
        <Text style={styles.subtitle}>
          초대코드가 있으면 무료로, 없으면 10,000원으로 가입할 수 있습니다
        </Text>

        <GlassCard>
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
        </GlassCard>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <GlassCard>
          <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
            <Text style={styles.payBtnText}>10,000원 결제하고 가입</Text>
            <Text style={styles.payBtnSub}>초대코드가 없어도 가입할 수 있어요</Text>
          </TouchableOpacity>
        </GlassCard>

        {__DEV__ && (
          <GlassCard style={{ marginTop: 0 }}>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => {
                router.push({
                  pathname: "/onboarding/profile",
                  params: { phone, is_seed: "true" },
                });
              }}
            >
              <Text style={[styles.payBtnText, { color: "#999" }]}>[테스트] 시드 유저로 가입</Text>
            </TouchableOpacity>
          </GlassCard>
        )}
      </View>
      <ResultToast visible={!!errorMsg} message={errorMsg} type="error" onDone={() => setErrorMsg("")} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28, lineHeight: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 10 },
  codeInput: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
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
    borderRadius: 14,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: COLORS.textLight },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.4)" },
  dividerText: { marginHorizontal: 16, fontSize: 13, color: COLORS.textLight },
  payBtn: { alignItems: "center" },
  payBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  payBtnSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
});
