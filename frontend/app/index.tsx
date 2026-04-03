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
import { COLORS } from "../src/constants/config";

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuthStore();

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
          style={styles.startButton}
          onPress={() => router.push("/onboarding/intro")}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/onboarding/phone")}
        >
          <Text style={styles.loginButtonText}>이미 계정이 있어요</Text>
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
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
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
