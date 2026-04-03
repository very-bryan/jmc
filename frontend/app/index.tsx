import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { loginWithKakao } from "../src/services/kakaoAuth";
import { trackEvent, EVENTS } from "../src/api/analytics";
import { COLORS } from "../src/constants/config";

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user, setToken, setUser } = useAuthStore();

  React.useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.profile_completed) {
        router.replace("/(tabs)");
      } else if (isAuthenticated && !user?.profile_completed) {
        router.replace("/onboarding/profile");
      }
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>진지한 만남 추구</Text>
        <Text style={styles.subtitle}>검증된 진지한 만남</Text>
        <Text style={styles.description}>
          실명·신원 검증을 기반으로{"\n"}
          결혼 의향이 있는 사람들이{"\n"}
          진지한 관계를 만드는 곳
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.kakaoButton}
          onPress={async () => {
            trackEvent(EVENTS.ONBOARDING_START);
            try {
              const result = await loginWithKakao();
              if (result.success) {
                if (result.isNewUser) {
                  router.push({
                    pathname: "/onboarding/invite",
                    params: {
                      kakao_id: result.kakaoInfo?.kakao_id,
                      kakao_nickname: result.kakaoInfo?.nickname,
                      kakao_email: result.kakaoInfo?.email,
                    },
                  });
                } else {
                  await setToken(result.token!);
                  setUser(result.user!);
                  router.replace("/(tabs)");
                }
              } else if (result.error) {
                // 카카오 키 미설정 시 전화번호 가입으로 안내
                router.push("/onboarding/intro");
              }
            } catch {
              router.push("/onboarding/intro");
            }
          }}
        >
          <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/onboarding/phone")}
        >
          <Text style={styles.loginButtonText}>휴대폰 번호로 로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.primary,
    fontStyle: "italic",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  bottom: {
    width: "100%",
    paddingBottom: 40,
    gap: 12,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  kakaoButtonText: {
    color: "#191919",
    fontSize: 16,
    fontWeight: "700",
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
