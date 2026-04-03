import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { VerificationBadge } from "./VerificationBadge";
import { COLORS } from "../constants/config";
import type { Post } from "../types";

const { width } = Dimensions.get("window");

interface Props {
  post: Post;
  onInterest?: () => void;
}

export function FeedCard({ post, onInterest }: Props) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => router.push(`/profile/${post.user.id}` as any)}
      >
        <View style={styles.avatar}>
          {post.user.profile_image_url ? (
            <Image source={{ uri: post.user.profile_image_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {post.user.nickname?.charAt(0) || "?"}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nickname}>{post.user.nickname}</Text>
            <VerificationBadge level={post.user.verification_level} />
          </View>
          <Text style={styles.meta}>
            {post.user.age}세 · {post.user.region}
          </Text>
        </View>
      </TouchableOpacity>

      {post.images.length > 0 && (
        <Image
          source={{ uri: post.images[0].url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.contentText}>{post.content}</Text>
        {post.mood_tag && (
          <Text style={styles.moodTag}>#{post.mood_tag}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.interestButton} onPress={onInterest}>
          <Text style={styles.interestText}>관심 보내기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nickname: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postImage: {
    width: width,
    height: width * 0.75,
  },
  content: {
    padding: 12,
  },
  contentText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  moodTag: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 6,
  },
  actions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  interestButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  interestText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
