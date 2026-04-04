import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfettiCannon from "react-native-confetti-cannon";
import { useThemeColors, useIsDark } from "../../src/hooks/useThemeColors";

export default function GraduationCompleteScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const isDark = useIsDark();
  const confettiRef = useRef<any>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={["top", "bottom"]}>
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: -10, y: 0 }}
        autoStart
        fadeOut
        fallSpeed={3000}
        colors={["#9C86FF", "#B8A5FF", "#FFD700", "#FF6B9D", "#5BD1D7", "#FF9A5C"]}
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

        <View style={[styles.flowerRow]}>
          <Text style={styles.flowerEmoji}>{"  "}</Text>
        </View>
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
            confettiRef.current?.start();
            setTimeout(() => router.replace("/(tabs)" as any), 1500);
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
  flowerRow: {
    marginTop: 24,
  },
  flowerEmoji: {
    fontSize: 36,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
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
