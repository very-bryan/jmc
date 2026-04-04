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
import { SafeAreaView } from "react-native-safe-area-context";
import { notificationApi } from "../../src/api";
import { useThemeColors } from "../../src/hooks/useThemeColors";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  actor: { id: number; nickname: string; profile_image_url: string | null } | null;
  target_type: string | null;
  target_id: number | null;
  created_at: string;
}

const DUMMY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 801, type: "interest_received", title: "지은님이 관심을 보냈어요",
    body: "프로필을 확인해보세요", read: false,
    actor: { id: 2, nickname: "지은", profile_image_url: null },
    target_type: null, target_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 802, type: "mutual_interest", title: "수현님과 상호 관심이 성립되었어요!",
    body: "지금 대화를 시작해보세요", read: false,
    actor: { id: 3, nickname: "수현", profile_image_url: null },
    target_type: null, target_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 803, type: "interest_received", title: "예진님이 관심을 보냈어요",
    body: "프로필을 확인해보세요", read: true,
    actor: { id: 7, nickname: "예진", profile_image_url: null },
    target_type: null, target_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 804, type: "system_notice", title: "진만추에 오신 걸 환영합니다!",
    body: "프로필을 완성하고 첫 관심을 보내보세요", read: true,
    actor: null, target_type: null, target_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

const ICON_MAP: Record<string, string> = {
  interest_received: "favorite",
  mutual_interest: "favorite",
  new_message: "chat-bubble",
  profile_view: "visibility",
  system_notice: "info",
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "방금";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.list();
      const data = res.data?.notifications || [];
      setNotifications(data.length > 0 ? data : DUMMY_NOTIFICATIONS);
    } catch {
      setNotifications(DUMMY_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePress = async (item: NotificationItem) => {
    if (!item.read) {
      notificationApi.read(item.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
    if (item.actor) {
      router.push(`/profile/${item.actor.id}` as any);
    }
  };

  const handleReadAll = async () => {
    notificationApi.readAll().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: C.text }]}>알림</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleReadAll}>
            <Text style={[styles.readAllText, { color: C.primary }]}>모두 읽음</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderBottomColor: C.border }, !item.read && { backgroundColor: C.primaryLight, marginHorizontal: -16, paddingHorizontal: 16, borderRadius: 14, borderBottomWidth: 0, marginBottom: 4 }]}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: C.primaryLight }, item.type === "mutual_interest" && { backgroundColor: C.primary }]}>
              <MaterialIcons
                name={(ICON_MAP[item.type] || "notifications") as any}
                size={20}
                color={item.type === "mutual_interest" ? "#fff" : C.primary}
              />
            </View>
            {item.actor && (
              <Image
                source={{ uri: `https://i.pravatar.cc/150?img=${(item.actor.id % 10) + 1}` }}
                style={[styles.avatar, { backgroundColor: C.surface }]}
              />
            )}
            <View style={styles.info}>
              <Text style={[styles.title, { color: C.text }, !item.read && styles.titleUnread]} numberOfLines={1}>
                {item.title}
              </Text>
              {item.body && (
                <Text style={[styles.body, { color: C.textSecondary }]} numberOfLines={1}>{item.body}</Text>
              )}
              <Text style={[styles.time, { color: C.textLight }]}>{formatTimeAgo(item.created_at)}</Text>
            </View>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: C.primary }]} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="notifications-none" size={48} color={C.textLight} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>알림이 없습니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  readAllText: { fontSize: 14, fontWeight: "600" },
  list: { paddingHorizontal: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, marginLeft: 10,
  },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: "600" },
  titleUnread: { fontWeight: "800" },
  body: { fontSize: 13, marginTop: 2 },
  time: { fontSize: 12, marginTop: 3 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, marginLeft: 8,
  },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
});
