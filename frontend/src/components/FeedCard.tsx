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
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => router.push(`/profile/${post.user.id}` as any)}
      >
        <View style={styles.avatar}>
          {post.user.profile_image_url ? (
            <Image source={{ uri: post.user.profile_image_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {post.user.nickname?.charAt(0) || "?"}
              </Text>
            </View>
          )}
          {post.user.verification_level !== "basic" && (
            <View style={styles.verifiedDot} />
          )}
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nickname}>{post.user.nickname}</Text>
            <VerificationBadge level={post.user.verification_level} />
          </View>
          <Text style={styles.meta}>
            {post.user.region} · {post.user.age}세
          </Text>
        </View>
        <Text style={styles.moreBtn}>···</Text>
      </TouchableOpacity>

      {/* Image */}
      {post.images.length > 0 && (
        <Image
          source={{ uri: post.images[0].url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <Text style={styles.actionIcon}>♥</Text>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionIcon}>➤</Text>
        </View>
        <TouchableOpacity style={styles.connectBtn} onPress={onInterest}>
          <Text style={styles.connectText}>Connect</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.contentText}>
          <Text style={styles.contentNickname}>{post.user.nickname}</Text>
          {"  "}{post.content}
        </Text>
        {post.mood_tag && (
          <Text style={styles.moodTag}>#{post.mood_tag}</Text>
        )}
        <Text style={styles.timeAgo}>
          {formatTimeAgo(post.created_at)}
        </Text>
      </View>
    </View>
  );
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: { width: 40, height: 40 },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: COLORS.textSecondary },
  verifiedDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userInfo: { marginLeft: 10, flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  nickname: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  moreBtn: { fontSize: 18, color: COLORS.textLight, paddingHorizontal: 8 },
  postImage: { width: width, height: width },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  leftActions: { flexDirection: "row", gap: 16 },
  actionIcon: { fontSize: 22 },
  connectBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 6,
  },
  connectText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  content: { paddingHorizontal: 14, paddingBottom: 12 },
  contentNickname: { fontWeight: "700", fontSize: 13, color: COLORS.text },
  contentText: { fontSize: 13, color: COLORS.text, lineHeight: 19 },
  moodTag: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  timeAgo: { fontSize: 11, color: COLORS.textLight, marginTop: 4, textTransform: "uppercase" },
});
