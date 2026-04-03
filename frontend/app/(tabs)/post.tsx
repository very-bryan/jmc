import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { postApi } from "../../src/api";
import { COLORS } from "../../src/constants/config";

const MOOD_TAGS = [
  "일상", "취미", "맛집", "여행", "운동", "독서", "음악", "반려동물", "요리",
];

export default function PostScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      await postApi.create({
        content: content.trim(),
        mood_tag: moodTag || undefined,
      });
      Alert.alert("완료", "게시글이 작성되었습니다");
      setContent("");
      setMoodTag("");
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("오류", err.response?.data?.errors?.join("\n") || "작성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>새 게시글</Text>
        <TouchableOpacity
          style={[styles.postBtn, !content.trim() && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={loading || !content.trim()}
        >
          <Text style={styles.postBtnText}>
            {loading ? "게시 중..." : "게시"}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="일상을 공유해주세요..."
        placeholderTextColor={COLORS.textLight}
        multiline
        maxLength={1000}
        value={content}
        onChangeText={setContent}
        autoFocus
      />

      <Text style={styles.charCount}>{content.length}/1000</Text>

      <Text style={styles.label}>기분/상황 태그</Text>
      <View style={styles.tagRow}>
        {MOOD_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, moodTag === tag && styles.tagActive]}
            onPress={() => setMoodTag(moodTag === tag ? "" : tag)}
          >
            <Text style={[styles.tagText, moodTag === tag && styles.tagTextActive]}>
              #{tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnDisabled: { backgroundColor: COLORS.textLight },
  postBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  input: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 150,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "right",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagText: { fontSize: 13, color: COLORS.textSecondary },
  tagTextActive: { color: "#fff", fontWeight: "600" },
});
