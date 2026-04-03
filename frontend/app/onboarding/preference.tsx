import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { preferenceFilterApi, profileApi } from "../../src/api";
import { useAuthStore } from "../../src/store/authStore";
import { COLORS } from "../../src/constants/config";

const GENDERS = [
  { value: "prefer_female", label: "여성" },
  { value: "prefer_male", label: "남성" },
  { value: "prefer_all", label: "모두" },
];

const AGE_RANGES = [
  { min: 25, max: 30, label: "25~30세" },
  { min: 26, max: 35, label: "26~35세" },
  { min: 30, max: 40, label: "30~40세" },
  { min: 35, max: 45, label: "35~45세" },
];

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "대전", "광주",
];

export default function PreferenceScreen() {
  const router = useRouter();
  const { fetchMe } = useAuthStore();

  const [gender, setGender] = useState("prefer_female");
  const [ageRange, setAgeRange] = useState({ min: 26, max: 35 });
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleRegion = (r: string) => {
    setRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await preferenceFilterApi.create({
        preferred_gender: gender,
        min_age: ageRange.min,
        max_age: ageRange.max,
        preferred_regions: regions,
      });

      await profileApi.selfieVerify(); // MVP: 간소화 처리
      await fetchMe();
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("오류", "저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>관심 조건 설정</Text>
      <Text style={styles.subtitle}>
        만나고 싶은 상대의 조건을 설정해주세요
      </Text>

      <Text style={styles.label}>희망 성별</Text>
      <View style={styles.chipRow}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g.value}
            style={[styles.chip, gender === g.value && styles.chipActive]}
            onPress={() => setGender(g.value)}
          >
            <Text style={[styles.chipText, gender === g.value && styles.chipTextActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>희망 연령대</Text>
      <View style={styles.chipRow}>
        {AGE_RANGES.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[
              styles.chip,
              ageRange.min === a.min && ageRange.max === a.max && styles.chipActive,
            ]}
            onPress={() => setAgeRange({ min: a.min, max: a.max })}
          >
            <Text
              style={[
                styles.chipText,
                ageRange.min === a.min && ageRange.max === a.max && styles.chipTextActive,
              ]}
            >
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>희망 지역 (복수 선택 가능)</Text>
      <View style={styles.chipRow}>
        {REGIONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, regions.includes(r) && styles.chipActive]}
            onPress={() => toggleRegion(r)}
          >
            <Text style={[styles.chipText, regions.includes(r) && styles.chipTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "저장 중..." : "시작하기"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
