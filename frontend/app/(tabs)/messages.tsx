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

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await conversationApi.list();
      setConversations(res.data.conversations);
    } catch {
      // ignore
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
