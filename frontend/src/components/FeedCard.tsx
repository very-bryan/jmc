import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { VerificationBadge } from "./VerificationBadge";
import { ConfirmModal, ResultToast } from "./ConfirmModal";
import { useThemeColors } from "../hooks/useThemeColors";
import client from "../api/client";
import type { Post } from "../types";

const { width } = Dimensions.get("window");

interface Props {
  post: Post;
  onInterest?: () => void;
}

export function FeedCard({ post, onInterest }: Props) {
  const router = useRouter();
  const C = useThemeColors();
  const [liked, setLiked] = useState((post as any).liked || false);
  const [likesCount, setLikesCount] = useState(
    (post as any).likes_count ?? Math.floor(Math.random() * 50 + 5)
  );
  const [showMore, setShowMore] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

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

    if (isDummy) return;

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
    setReportModal(true);
  };

  const handleBlock = () => {
    setShowMore(false);
    setBlockModal(true);
  };

  const confirmReport = () => {
    setReportModal(false);
    setToastMsg("신고가 접수되었습니다");
  };

  const confirmBlock = () => {
    setBlockModal(false);
    setToastMsg("차단되었습니다");
  };

  return (
    <View style={[styles.card, { backgroundColor: C.background, borderBottomColor: C.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileArea} onPress={() => router.push(`/profile/${post.user.id}` as any)}>
          <View style={[styles.avatarRing, { borderColor: C.primary }]}>
            <View style={[styles.avatarInner, { backgroundColor: C.surface }]}>
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            </View>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.nickname, { color: C.text }]}>{post.user.nickname}</Text>
              {post.user.verification_level !== "basic" && (
                <View style={[styles.verifiedBadge, { backgroundColor: C.badgeBlue }]} />
              )}
              <VerificationBadge level={post.user.verification_level} />
            </View>
            <Text style={[styles.meta, { color: C.textSecondary }]}>
              {post.user.region} · {post.user.age}세
            </Text>
          </View>
        </TouchableOpacity>
        <View>
          <TouchableOpacity style={styles.moreBtn} onPress={() => setShowMore(!showMore)}>
            <MaterialIcons name="more-horiz" size={22} color={C.textLight} />
          </TouchableOpacity>
          {showMore && (
            <View style={[styles.popover, { backgroundColor: C.background }]}>
              <TouchableOpacity style={styles.popItem} onPress={handleReport}>
                <MaterialIcons name="flag" size={16} color={C.error} />
                <Text style={[styles.popText, { color: C.error }]}>신고</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popItem} onPress={handleBlock}>
                <MaterialIcons name="block" size={16} color={C.text} />
                <Text style={[styles.popText, { color: C.text }]}>차단</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Square Image */}
      <Image source={{ uri: postImageUri }} style={styles.postImage} resizeMode="cover" />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLike}>
            <MaterialIcons
              name={liked ? "favorite" : "favorite-border"}
              size={26}
              color={liked ? C.primary : C.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <MaterialIcons name="send" size={24} color={C.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.connectBtn, { backgroundColor: C.primary }]} onPress={onInterest}>
          <Text style={styles.connectText}>관심 보내기</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.likesText, { color: C.text }]}>좋아요 {likesCount}개</Text>
        <Text style={[styles.contentText, { color: C.text }]}>
          <Text style={[styles.contentNickname, { color: C.text }]}>{post.user.nickname}</Text>
          {"  "}{post.content}
        </Text>
        {post.mood_tag && <Text style={[styles.moodTag, { color: C.primary }]}>#{post.mood_tag}</Text>}
        <Text style={[styles.timeAgo, { color: C.textLight }]}>{formatTimeAgo(post.created_at)}</Text>
      </View>

      <ConfirmModal
        visible={reportModal}
        icon="flag"
        iconColor={C.error}
        title="게시글을 신고하시겠습니까?"
        message="허위 신고 시 제재를 받을 수 있습니다"
        confirmText="신고"
        confirmColor={C.error}
        onConfirm={confirmReport}
        onCancel={() => setReportModal(false)}
      />
      <ConfirmModal
        visible={blockModal}
        icon="block"
        iconColor={C.textSecondary}
        title="이 사용자를 차단하시겠습니까?"
        message="차단하면 서로의 게시글과 프로필을 볼 수 없습니다"
        confirmText="차단"
        confirmColor={C.error}
        onConfirm={confirmBlock}
        onCancel={() => setBlockModal(false)}
      />
      <ResultToast
        visible={!!toastMsg}
        message={toastMsg}
        onDone={() => setToastMsg("")}
      />
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
    borderBottomWidth: 0.5,
    zIndex: 1,
    overflow: "visible",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 100,
  },
  avatarRing: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2,
    justifyContent: "center", alignItems: "center", padding: 2,
  },
  avatarInner: {
    width: 36, height: 36, borderRadius: 18,
    overflow: "hidden",
  },
  avatarImage: { width: 36, height: 36 },
  verifiedBadge: {
    width: 8, height: 8, borderRadius: 4,
    marginLeft: -2,
  },
  profileArea: { flexDirection: "row", alignItems: "center", flex: 1 },
  userInfo: { marginLeft: 10, flex: 1 },
  moreBtn: { padding: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  nickname: { fontSize: 14, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 1 },
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
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12,
  },
  connectText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  content: { paddingHorizontal: 14, paddingBottom: 14 },
  likesText: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  contentNickname: { fontWeight: "700", fontSize: 13 },
  contentText: { fontSize: 13, lineHeight: 19 },
  moodTag: { fontSize: 12, marginTop: 4 },
  timeAgo: { fontSize: 11, marginTop: 4, textTransform: "uppercase" },

  popover: {
    position: "absolute",
    top: 28,
    right: 0,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  popItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  popText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
