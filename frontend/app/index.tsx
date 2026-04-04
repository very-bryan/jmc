import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { loginWithKakao } from "../src/services/kakaoAuth";
import { trackEvent, EVENTS } from "../src/api/analytics";
import { COLORS } from "../src/constants/config";

const { width } = Dimensions.get("window");

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 배경 장식 원 */}
      <View style={styles.decoCircleTopLeft} />
      <View style={styles.decoCircleTopRight} />

      {/* 콘텐츠 */}
      <View style={styles.content}>
        <Text style={styles.brandLabel}>JINMANCHU</Text>
        <Text style={styles.title}>진만추</Text>

        <Text style={styles.headline}>
          소개팅앱보다 진지하게{"\n"}일상으로 알아가는 진짜 관계
        </Text>
        <Text style={styles.description}>
          서로의 일상을 공유하며, 자연스럽고 신뢰할 수 있는 만남{"\n"}
          을 추구하는 MZ 세대를 위한 프리미엄 소셜 커뮤니티.
        </Text>

        {/* 메인 이미지 */}
        <View style={styles.imageWrap}>
          <Image
            source={require("../assets/splash-couple.webp")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottom}>
        <Text style={styles.ctaLabel}>지금, 새로운 일상을 시작하세요.</Text>
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
                router.push("/onboarding/intro");
              }
            } catch {
              router.push("/onboarding/intro");
            }
          }}
        >
          <Text style={styles.kakaoButtonText}>카카오톡으로 시작하기</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    paddingHorizontal: 24,
  },

  // 장식 원
  decoCircleTopLeft: {
    position: "absolute",
    top: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C9BFFF",
    opacity: 0.4,
  },
  decoCircleTopRight: {
    position: "absolute",
    top: 200,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#B8A5FF",
    opacity: 0.25,
  },

  // 콘텐츠
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  brandLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 64,
    fontWeight: "900",
    color: "#9C86FF",
    marginBottom: 20,
  },
  headline: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  // 이미지
  imageWrap: {
    width: width - 48,
    aspectRatio: 1024 / 858,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },

  ctaLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginVertical: 16,
  },

  // 하단 버튼
  bottom: {
    width: "100%",
    paddingBottom: 40,
    gap: 10,
    alignItems: "center",
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  kakaoButtonText: {
    color: "#191919",
    fontSize: 16,
    fontWeight: "700",
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
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
