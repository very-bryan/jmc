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
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../src/store/authStore";
import { loginWithKakao } from "../src/services/kakaoAuth";
import { trackEvent, EVENTS } from "../src/api/analytics";
import { COLORS } from "../src/constants/config";

const { width, height: screenHeight } = Dimensions.get("window");

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
      <LinearGradient colors={["#E8E0F0", "#F5F1EA", "#F0E8E0"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#E8E0F0", "#F5F1EA", "#F0E8E0", "#EDE8F5"]}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      {/* 배경 장식 */}
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />
      <View style={styles.decoCircle3} />

      {/* 글래스 타이틀 카드 */}
      <View style={styles.content}>
        <BlurView intensity={40} tint="light" style={styles.glassTitle}>
          <View style={styles.glassTitleInner}>
            <Text style={styles.brandLabel}>JINMANCHU</Text>
            <Text style={styles.title}>진만추</Text>
          </View>
        </BlurView>

        <Text style={styles.headline}>
          소개팅앱보다 진지하게{"\n"}일상으로 알아가는 진짜 관계
        </Text>

        {/* 글래스 설명 카드 */}
        <BlurView intensity={30} tint="light" style={styles.glassDesc}>
          <View style={styles.glassDescInner}>
            <Text style={styles.description}>
              서로의 일상을 공유하며, 자연스럽고 신뢰할 수 있는{"\n"}
              만남을 추구하는 MZ 세대를 위한 프리미엄 커뮤니티.
            </Text>
          </View>
        </BlurView>

        {/* 메인 이미지 */}
        <View style={styles.imageWrap}>
          <Image
            source={require("../assets/splash-couple.webp")}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* 이미지 위 글래스 오버레이 */}
          <BlurView intensity={60} tint="light" style={styles.imageGlassOverlay}>
            <View style={styles.imageGlassInner}>
              <Text style={styles.imageOverlayText}>검증된 사람과 안전하게</Text>
            </View>
          </BlurView>
        </View>
      </View>

      {/* 하단 글래스 버튼 영역 */}
      <BlurView intensity={50} tint="light" style={styles.bottomGlass}>
        <View style={styles.bottomInner}>
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
      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },

  // 배경 장식 원 (글래스 뒤에서 비치는 용도)
  decoCircle1: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#C9BFFF",
    opacity: 0.5,
  },
  decoCircle2: {
    position: "absolute",
    top: screenHeight * 0.35,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E5C0B0",
    opacity: 0.4,
  },
  decoCircle3: {
    position: "absolute",
    bottom: 100,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#B8A5FF",
    opacity: 0.3,
  },

  // 콘텐츠
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 50,
  },

  // 글래스 타이틀 카드
  glassTitle: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
  },
  glassTitleInner: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 24,
  },
  brandLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: 2,
  },
  title: {
    fontSize: 64,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -1,
  },

  headline: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2c2c2c",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 12,
  },

  // 글래스 설명 카드
  glassDesc: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  glassDescInner: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 16,
  },
  description: {
    fontSize: 13,
    color: "#5c5c5c",
    textAlign: "center",
    lineHeight: 20,
  },

  // 이미지
  imageWrap: {
    width: width - 48,
    aspectRatio: 1024 / 858,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageGlassOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 14,
    overflow: "hidden",
  },
  imageGlassInner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 14,
    alignItems: "center",
  },
  imageOverlayText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // 하단 글래스 영역
  bottomGlass: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  bottomInner: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.6)",
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2c2c2c",
    textAlign: "center",
    marginBottom: 6,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  kakaoButtonText: {
    color: "#191919",
    fontSize: 17,
    fontWeight: "700",
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  loginButtonText: {
    color: "#5c5c5c",
    fontSize: 16,
    fontWeight: "600",
  },
});
