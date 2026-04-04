import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { useThemeColors } from "../../src/hooks/useThemeColors";

const { width, height } = Dimensions.get("window");

export default function GraduationCompleteScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    lottieRef.current?.play();
  }, []);

  const replay = () => {
    lottieRef.current?.reset();
    lottieRef.current?.play();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={["top", "bottom"]}>
      {/* Lottie confetti overlay */}
      <LottieView
        ref={lottieRef}
        source={require("../../assets/confetti.json")}
        style={styles.lottie}
        resizeMode="cover"
        loop={false}
        autoPlay
      />

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: C.primaryLight }]}>
          <MaterialIcons name="school" size={48} color={C.primary} />
        </View>

        <Text style={[styles.congrats, { color: C.primary }]}>CONGRATULATIONS</Text>
        <Text style={[styles.title, { color: C.text }]}>
          졸업을 축하합니다!
        </Text>

        <Text style={[styles.desc, { color: C.textSecondary }]}>
          좋은 인연을 만나셨군요.{"\n"}
          진심으로 축하드립니다.{"\n\n"}
          진만추는 두 분의 행복을 응원합니다.{"\n"}
          멋진 사랑 이어가세요!
        </Text>
      </View>

      <View style={styles.bottom}>
        <View style={[styles.noticeCard, { backgroundColor: C.surface }]}>
          <MaterialIcons name="info-outline" size={16} color={C.textLight} />
          <Text style={[styles.noticeText, { color: C.textSecondary }]}>
            계정이 비활성화되어 다른 회원에게 표시되지 않습니다.
            다시 활성화하려면 설정에서 휴면해제를 해주세요.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.primary }]}
          onPress={() => {
            replay();
            setTimeout(() => router.replace("/(tabs)" as any), 2000);
          }}
        >
          <Text style={styles.btnText}>진만추 졸업!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lottie: {
    position: "absolute",
    width: width,
    height: height,
    top: 0,
    left: 0,
    zIndex: 10,
    pointerEvents: "none",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    zIndex: 1,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  congrats: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  desc: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 26,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
    zIndex: 20,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  noticeText: { fontSize: 12, flex: 1, lineHeight: 18 },
  btn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
