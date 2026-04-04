import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { VerificationBadge } from "./VerificationBadge";
import { COLORS } from "../constants/config";
import client from "../api/client";
import type { Post } from "../types";

const { width } = Dimensions.get("window");

interface Props {
  post: Post;
  onInterest?: () => void;
}

export function FeedCard({ post, onInterest }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState((post as any).liked || false);
  const [likesCount, setLikesCount] = useState(
    (post as any).likes_count ?? Math.floor(Math.random() * 50 + 5)
  );
  const [showMore, setShowMore] = useState(false);

  const avatarUri =
    post.user.profile_image_url ||
    `https://i.pravatar.cc/150?img=${(post.user.id % 10) + 1}`;

  const postImageUri =
    post.images.length > 0
      ? post.images[0].url
      : `https://picsum.photos/400/400?random=${post.id}`;

  const isDummy = post.id >= 800 && post.id < 900;

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((prev: number) => prev + (wasLiked ? -1 : 1));

    if (isDummy) return; // 더미 포스트는 API 호출 안 함

    try {
      if (wasLiked) {
        await client.delete(`/posts/${post.id}/like`);
      } else {
        await client.post(`/posts/${post.id}/like`);
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount((prev: number) => prev + (wasLiked ? 1 : -1));
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.user.nickname}님의 게시글을 확인해보세요!\n\n"${post.content.slice(0, 100)}"\n\n진만추 - 진지한 만남 추구\nhttps://jmc-landing.verycloud.io`,
      });
    } catch {
      // 취소
    }
  };

  const handleReport = () => {
    setShowMore(false);
    Alert.alert("신고", "이 게시글을 신고하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "신고", style: "destructive", onPress: () => Alert.alert("완료", "신고가 접수되었습니다") },
    ]);
  };

  const handleBlock = () => {
    setShowMore(false);
    Alert.alert("차단", "이 사용자를 차단하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "차단", style: "destructive", onPress: () => Alert.alert("완료", "차단되었습니다") },
    ]);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => router.push(`/profile/${post.user.id}` as any)}
      >
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
        <TouchableOpacity onPress={() => setShowMore(true)}>
          <MaterialIcons name="more-horiz" size={22} color={COLORS.textLight} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Square Image */}
      <Image source={{ uri: postImageUri }} style={styles.postImage} resizeMode="cover" />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLike}>
            <MaterialIcons
              name={liked ? "favorite" : "favorite-border"}
              size={26}
              color={liked ? COLORS.primary : COLORS.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <MaterialIcons name="send" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.connectBtn} onPress={onInterest}>
          <Text style={styles.connectText}>관심 보내기</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.likesText}>좋아요 {likesCount}개</Text>
        <Text style={styles.contentText}>
          <Text style={styles.contentNickname}>{post.user.nickname}</Text>
          {"  "}{post.content}
        </Text>
        {post.mood_tag && <Text style={styles.moodTag}>#{post.mood_tag}</Text>}
        <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
      </View>

      {/* 바텀시트 더보기 메뉴 */}
      <Modal visible={showMore} transparent animationType="fade" onRequestClose={() => setShowMore(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMore(false)}>
          <Pressable style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity style={styles.sheetItem} onPress={handleReport}>
              <MaterialIcons name="flag" size={22} color={COLORS.error} />
              <Text style={[styles.sheetText, { color: COLORS.error }]}>신고</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={handleBlock}>
              <MaterialIcons name="block" size={22} color={COLORS.text} />
              <Text style={styles.sheetText}>차단</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetItem, styles.sheetCancel]} onPress={() => setShowMore(false)}>
              <Text style={styles.sheetCancelText}>취소</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: COLORS.primary,
    justifyContent: "center", alignItems: "center", padding: 2,
  },
  avatarInner: {
    width: 36, height: 36, borderRadius: 18,
    overflow: "hidden", backgroundColor: COLORS.surface,
  },
  avatarImage: { width: 36, height: 36 },
  verifiedBadge: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.badgeBlue, marginLeft: -2,
  },
  userInfo: { marginLeft: 10, flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  nickname: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  postImage: { width: width, height: width },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  leftActions: { flexDirection: "row", gap: 16 },
  connectBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12,
  },
  connectText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  content: { paddingHorizontal: 14, paddingBottom: 14 },
  likesText: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  contentNickname: { fontWeight: "700", fontSize: 13, color: COLORS.text },
  contentText: { fontSize: 13, color: COLORS.text, lineHeight: 19 },
  moodTag: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  timeAgo: { fontSize: 11, color: COLORS.textLight, marginTop: 4, textTransform: "uppercase" },

  // 바텀시트
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  sheetText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  sheetCancel: {
    justifyContent: "center",
    borderBottomWidth: 0,
  },
  sheetCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textAlign: "center",
    width: "100%",
  },
});
