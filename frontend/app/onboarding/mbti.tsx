import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { profileApi } from "../../src/api";
import { useAuthStore } from "../../src/store/authStore";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { MBTI_GROUPS, MbtiType } from "../../src/constants/mbti";
import { COLORS } from "../../src/constants/config";

export default function MbtiScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const { user, fetchMe } = useAuthStore();
  const [selected, setSelected] = useState<string | null>(user?.mbti || null);
  const [showMbti, setShowMbti] = useState(user?.show_mbti !== false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update({ mbti: selected, show_mbti: showMbti } as any);
      await fetchMe();
      router.back();
    } catch {
      Alert.alert("오류", "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.title, { color: C.text }]}>MBTI 설정</Text>
      <Text style={[styles.desc, { color: C.textSecondary }]}>
        상대방과의 MBTI 궁합을 확인할 수 있어요
      </Text>

      {/* 공개 토글 */}
      <View style={[styles.toggleRow, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={styles.toggleInfo}>
          <MaterialIcons name="visibility" size={20} color={C.textSecondary} />
          <Text style={[styles.toggleLabel, { color: C.text }]}>MBTI 궁합 표시</Text>
        </View>
        <Switch
          value={showMbti}
          onValueChange={setShowMbti}
          trackColor={{ true: C.primary, false: C.border }}
        />
      </View>
      <Text style={[styles.toggleHint, { color: C.textLight }]}>
        끄면 내 MBTI와 궁합이 상대방에게 표시되지 않아요
      </Text>

      {/* MBTI 선택 */}
      {Object.entries(MBTI_GROUPS).map(([group, types]) => (
        <View key={group} style={styles.groupSection}>
          <Text style={[styles.groupTitle, { color: C.textSecondary }]}>{group}</Text>
          <View style={styles.typeGrid}>
            {types.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  { backgroundColor: C.surface, borderColor: C.border },
                  selected === type && { backgroundColor: C.primary, borderColor: C.primary },
                ]}
                onPress={() => setSelected(selected === type ? null : type)}
              >
                <Text style={[
                  styles.typeText,
                  { color: C.text },
                  selected === type && { color: "#fff" },
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* 모름 버튼 */}
      <TouchableOpacity
        style={[styles.unknownBtn, { borderColor: C.border }]}
        onPress={() => setSelected(null)}
      >
        <Text style={[styles.unknownText, { color: C.textSecondary }, !selected && { color: C.primary, fontWeight: "700" }]}>
          잘 모르겠어요
        </Text>
      </TouchableOpacity>

      {/* 저장 */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: C.primary }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? "저장 중..." : "저장"}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  desc: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  toggleLabel: { fontSize: 15, fontWeight: "600" },
  toggleHint: { fontSize: 12, marginTop: 6, marginBottom: 20, marginLeft: 4 },
  groupSection: { marginBottom: 20 },
  groupTitle: { fontSize: 13, fontWeight: "700", marginBottom: 10 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeChip: {
    width: "22%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  typeText: { fontSize: 14, fontWeight: "700" },
  unknownBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  unknownText: { fontSize: 14, fontWeight: "600" },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
