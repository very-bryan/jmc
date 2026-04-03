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
import { MaterialIcons } from "@expo/vector-icons";
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

  const avatarUri =
    post.user.profile_image_url ||
    `https://i.pravatar.cc/150?img=${(post.user.id % 10) + 1}`;

  const postImageUri =
    post.images.length > 0
      ? post.images[0].url
      : `https://picsum.photos/400/400?random=${post.id}`;

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => router.push(`/profile/${post.user.id}` as any)}
      >
        {/* Avatar with gradient ring */}
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          </View>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nickname}>{post.user.nickname}</Text>
            {post.user.verification_level !== "basic" && (
              <View style={styles.verifiedBadge} />
            )}
            <VerificationBadge level={post.user.verification_level} />
          </View>
          <Text style={styles.meta}>
            {post.user.region} · {post.user.age}세
          </Text>
        </View>
        <MaterialIcons name="more-horiz" size={22} color={COLORS.textLight} />
      </TouchableOpacity>

      {/* Square Image */}
      <Image
        source={{ uri: postImageUri }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity>
            <MaterialIcons name="favorite-border" size={26} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="chat-bubble-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="send" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.connectBtn} onPress={onInterest}>
          <Text style={styles.connectText}>관심 보내기</Text>
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <View style={styles.content}>
        <Text style={styles.likesText}>
          좋아요 {Math.floor(Math.random() * 50 + 5)}개
        </Text>
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
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  avatarInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },
  avatarImage: { width: 36, height: 36 },
  verifiedBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.badgeBlue,
    marginLeft: -2,
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
  actionIcon: { fontSize: 22, color: COLORS.text },
  connectBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  connectText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  content: { paddingHorizontal: 14, paddingBottom: 14 },
  likesText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  contentNickname: { fontWeight: "700", fontSize: 13, color: COLORS.text },
  contentText: { fontSize: 13, color: COLORS.text, lineHeight: 19 },
  moodTag: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  timeAgo: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
    textTransform: "uppercase",
  },
});
