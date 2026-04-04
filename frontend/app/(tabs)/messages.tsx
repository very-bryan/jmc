import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { conversationApi } from "../../src/api";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import type { Conversation } from "../../src/types";

const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: 901, status: "active", last_message_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    last_message: { content: "그 전시 정말 좋았어요! 다음에 같이 가요", sender_id: 2, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
    user: { id: 2, nickname: "지은", age: 29, region: "서울", profile_image_url: null, verification_level: "profile_verified" },
  },
  {
    id: 902, status: "active", last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    last_message: { content: "주말에 한강 러닝 어때요?", sender_id: 3, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
    user: { id: 3, nickname: "수현", age: 28, region: "경기", profile_image_url: null, verification_level: "selfie_verified" },
  },
  {
    id: 903, status: "active", last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    last_message: { content: "카페 추천 감사합니다", sender_id: 0, created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), read: true },
    user: { id: 5, nickname: "하은", age: 30, region: "인천", profile_image_url: null, verification_level: "profile_verified" },
  },
  {
    id: 904, status: "active", last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    last_message: { content: "프로필 사진이 정말 자연스럽네요", sender_id: 7, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
    user: { id: 7, nickname: "예진", age: 27, region: "서울", profile_image_url: null, verification_level: "phone_verified" },
  },
  {
    id: 905, status: "active", last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    last_message: { content: "독서 모임 어떠셨어요?", sender_id: 4, created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true },
    user: { id: 4, nickname: "민서", age: 31, region: "서울", profile_image_url: null, verification_level: "fully_verified" },
  },
];

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "방금";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function MessagesScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await conversationApi.list();
      const real = res.data?.conversations || [];
      setConversations(real.length > 0 ? real : DUMMY_CONVERSATIONS);
    } catch {
      setConversations(DUMMY_CONVERSATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.notice, { backgroundColor: C.primaryLight }]}>
        <MaterialIcons name="shield" size={14} color={C.primary} />
        <Text style={[styles.noticeText, { color: C.primary }]}>
          금전 요청에 응하지 말고, 첫 만남은 공공장소에서 하세요
        </Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isUnread = item.last_message && !item.last_message.read;
          return (
            <TouchableOpacity
              style={[styles.card, { borderBottomColor: C.border }]}
              onPress={() => router.push(`/chat/${item.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: `https://i.pravatar.cc/150?img=${(item.user.id ?? item.id) % 10 + 1}` }}
                  style={[styles.avatar, { backgroundColor: C.surface }]}
                />
                {item.user.verification_level !== "basic" && (
                  <View style={[styles.verifiedDot, { backgroundColor: C.primary, borderColor: C.background }]} />
                )}
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={[styles.nickname, { color: C.text }, isUnread && styles.nicknameUnread]}>
                    {item.user.nickname}
                  </Text>
                  {item.last_message && (
                    <Text style={[styles.time, { color: C.textLight }]}>
                      {formatTime(item.last_message.created_at)}
                    </Text>
                  )}
                </View>
                <View style={styles.bottomRow}>
                  <Text
                    style={[styles.preview, { color: C.textSecondary }, isUnread && { color: C.text, fontWeight: "600" }]}
                    numberOfLines={1}
                  >
                    {item.last_message?.content?.startsWith("[사진]")
                    ? "사진을 보냈습니다."
                    : item.last_message?.content || "대화를 시작해보세요"}
                  </Text>
                  {isUnread && <View style={[styles.unreadDot, { backgroundColor: C.primary }]} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="chat-bubble-outline" size={48} color={C.textLight} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>아직 대화가 없습니다</Text>
            <Text style={[styles.emptyDesc, { color: C.textSecondary }]}>상호 관심이 성립되면 대화할 수 있어요</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  noticeText: { fontSize: 12, fontWeight: "500" },
  list: { paddingHorizontal: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  verifiedDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  info: { flex: 1, marginLeft: 14 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nickname: { fontSize: 16, fontWeight: "600" },
  nicknameUnread: { fontWeight: "800" },
  time: { fontSize: 12 },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  preview: { fontSize: 14, flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyDesc: { fontSize: 14 },
});
