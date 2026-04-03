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
      <View style={styles.decoHeart}>
        <Text style={styles.decoHeartText}>♥</Text>
      </View>

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

        {/* 이미지 영역 (나중에 교체) */}
        <View style={styles.imageWrap}>
          <View style={styles.imagePlaceholder} />
        </View>

        <Text style={styles.ctaLabel}>지금, 새로운 일상을 시작하세요.</Text>
      </View>

      {/* 하단 버튼 */}
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
    backgroundColor: "#E8D5D0",
    opacity: 0.5,
  },
  decoCircleTopRight: {
    position: "absolute",
    top: 200,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#C8C9C0",
    opacity: 0.4,
  },
  decoHeart: {
    position: "absolute",
    top: 30,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D4A0A0",
    justifyContent: "center",
    alignItems: "center",
  },
  decoHeartText: {
    color: "#fff",
    fontSize: 20,
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
    fontSize: 48,
    fontWeight: "800",
    color: "#8B5E3C",
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
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },

  ctaLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  // 하단 버튼
  bottom: {
    width: "100%",
    paddingBottom: 40,
    gap: 10,
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
  loginButton: {
    paddingVertical: 16,
    borderRadius: 14,
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
