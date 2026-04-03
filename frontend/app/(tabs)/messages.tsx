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
import { conversationApi } from "../../src/api";
import { COLORS } from "../../src/constants/config";
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
    last_message: { content: "카페 추천 감사합니다 ☺️", sender_id: 0, created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), read: true },
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

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await conversationApi.list();
      const real = res.data.conversations;
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

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "방금";
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          안전 수칙: 금전 요청에 응하지 말고, 첫 만남은 공공장소에서 하세요
        </Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/chat/${item.id}` as any)}
          >
            <Image
              source={{ uri: `https://i.pravatar.cc/150?img=${(item.user.id ?? item.id) % 10 + 1}` }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <View style={styles.topRow}>
                <Text style={styles.nickname}>{item.user.nickname}</Text>
                {item.last_message && (
                  <Text style={styles.time}>
                    {formatTime(item.last_message.created_at)}
                  </Text>
                )}
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {item.last_message?.content || "대화를 시작해보세요"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>아직 대화가 없습니다</Text>
            <Text style={styles.emptySubtext}>상호 관심이 성립되면 대화할 수 있어요</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notice: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  noticeText: { fontSize: 12, color: "#92400E", textAlign: "center" },
  card: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
  },
  info: { flex: 1, marginLeft: 12 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nickname: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  time: { fontSize: 12, color: COLORS.textLight },
  preview: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  empty: { alignItems: "center", padding: 60 },
  emptyText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
