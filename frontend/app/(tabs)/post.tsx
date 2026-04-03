import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { postApi } from "../../src/api";
import { uploadImage } from "../../src/api/upload";
import { COLORS } from "../../src/constants/config";

const MOOD_TAGS = [
  "일상", "취미", "맛집", "여행", "운동", "독서", "음악", "반려동물", "요리",
];

export default function PostScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert("알림", "사진은 최대 4장까지 첨부할 수 있습니다");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 4 - images.length,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;

    setLoading(true);
    try {
      // 이미지 업로드
      const uploadedImages: { image_url: string; position: number }[] = [];
      if (images.length > 0) {
        setUploading(true);
        for (let i = 0; i < images.length; i++) {
          const result = await uploadImage(images[i], "posts");
          if (result?.url) {
            uploadedImages.push({ image_url: result.url, position: i });
          }
        }
        setUploading(false);
      }

      await postApi.create({
        content: content.trim() || " ",
        mood_tag: moodTag || undefined,
        post_images_attributes: uploadedImages.length > 0 ? uploadedImages : undefined,
      });

      Alert.alert("완료", "게시글이 작성되었습니다");
      setContent("");
      setMoodTag("");
      setImages([]);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("오류", err.response?.data?.errors?.join("\n") || "작성에 실패했습니다");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>새 게시글</Text>
        <TouchableOpacity
          style={[styles.postBtn, (!content.trim() && images.length === 0) && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={loading || (!content.trim() && images.length === 0)}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postBtnText}>게시</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 사진 영역 */}
      <View style={styles.imageSection}>
        {images.map((uri, i) => (
          <View key={i} style={styles.imageThumb}>
            <Image source={{ uri }} style={styles.thumbImage} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
              <MaterialIcons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 4 && (
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <MaterialIcons name="add-photo-alternate" size={28} color={COLORS.textLight} />
            <Text style={styles.addImageText}>{images.length}/4</Text>
          </TouchableOpacity>
        )}
      </View>

      {uploading && (
        <View style={styles.uploadingBar}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.uploadingText}>사진 업로드 중...</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="일상을 공유해주세요..."
        placeholderTextColor={COLORS.textLight}
        multiline
        maxLength={1000}
        value={content}
        onChangeText={setContent}
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

      <View style={{ height: 40 }} />
    </ScrollView>
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
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  postBtnDisabled: { backgroundColor: COLORS.textLight },
  postBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  // Images
  imageSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  thumbImage: { width: 80, height: 80 },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  uploadingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  uploadingText: { fontSize: 13, color: COLORS.primary },

  input: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 120,
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
