import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../src/hooks/useThemeColors";

export default function GraduationPendingScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const { nickname } = useLocalSearchParams<{ nickname: string }>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={["top"]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: C.primaryLight }]}>
          <MaterialIcons name="hourglass-top" size={40} color={C.primary} />
        </View>

        <Text style={[styles.title, { color: C.text }]}>졸업 신청 완료</Text>

        <Text style={[styles.desc, { color: C.textSecondary }]}>
          {nickname}님에게 졸업 신청을 보냈습니다.{"\n"}
          상대방이 수락하면 졸업이 완료됩니다.
        </Text>

        <View style={[styles.infoCard, { backgroundColor: C.surface }]}>
          <MaterialIcons name="info-outline" size={18} color={C.textLight} />
          <Text style={[styles.infoText, { color: C.textSecondary }]}>
            {nickname}님이 수락하면 알림으로 알려드릴게요
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.primary }]}
          onPress={() => router.replace("/(tabs)" as any)}
        >
          <Text style={styles.btnText}>홈으로 돌아가기</Text>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  desc: { fontSize: 15, textAlign: "center", lineHeight: 23, marginBottom: 32 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  infoText: { fontSize: 13, flex: 1, lineHeight: 19 },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
