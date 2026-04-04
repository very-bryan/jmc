import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { interestApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { VerificationBadge } from "../../src/components/VerificationBadge";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import type { Interest } from "../../src/types";

type Tab = "received" | "sent" | "mutual";

const DUMMY_INTERESTS: Interest[] = [
  { id: 701, status: "pending", user: { id: 2, nickname: "지은", age: 29, region: "서울", profile_image_url: null, verification_level: "profile_verified" }, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 702, status: "pending", user: { id: 6, nickname: "성민", age: 33, region: "부산", profile_image_url: null, verification_level: "selfie_verified" }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: 703, status: "pending", user: { id: 7, nickname: "예진", age: 27, region: "서울", profile_image_url: null, verification_level: "fully_verified" }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: 704, status: "accepted", user: { id: 3, nickname: "수현", age: 28, region: "경기", profile_image_url: null, verification_level: "profile_verified" }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "방금";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function ExploreScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const [tab, setTab] = useState<Tab>("received");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInterests = async (t: Tab) => {
    setLoading(true);
    setTab(t);
    try {
      const res = await interestApi.list(t);
      const data = res.data?.interests || [];
      setInterests(data.length > 0 ? data : DUMMY_INTERESTS);
    } catch {
      setInterests(DUMMY_INTERESTS);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInterests("received");
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await interestApi.accept(id);
      trackEvent(EVENTS.INTEREST_ACCEPT);
      trackEvent(EVENTS.MUTUAL_INTEREST);
      fetchInterests(tab);
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: C.text }]}>관심</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.tabs}>
        {(["received", "sent", "mutual"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, { backgroundColor: C.surface }, tab === t && { backgroundColor: C.primary }]}
            onPress={() => fetchInterests(t)}
          >
            <Text style={[styles.tabText, { color: C.textSecondary }, tab === t && styles.tabTextActive]}>
              {t === "received" ? "나를 본 사람" : t === "sent" ? "보낸 관심" : "상호 관심"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={C.primary} />
      ) : (
        <FlatList
          data={interests}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { borderBottomColor: C.border }]}
              onPress={() => router.push(`/profile/${item.user.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: `https://i.pravatar.cc/150?img=${(item.user.id % 10) + 1}` }}
                  style={[styles.avatar, { backgroundColor: C.surface }]}
                />
                {item.user.verification_level !== "basic" && (
                  <View style={[styles.verifiedDot, { backgroundColor: C.primary, borderColor: C.background }]} />
                )}
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={[styles.nickname, { color: C.text }]}>{item.user.nickname}</Text>
                  <VerificationBadge level={item.user.verification_level} />
                </View>
                <Text style={[styles.meta, { color: C.textSecondary }]}>
                  {item.user.age}세 · {item.user.region} · {formatTimeAgo(item.created_at)}
                </Text>
              </View>
              {tab === "received" && item.status === "pending" && (
                <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: C.primary }]} onPress={() => handleAccept(item.id)}>
                  <MaterialIcons name="favorite" size={16} color="#fff" />
                  <Text style={styles.acceptText}>수락</Text>
                </TouchableOpacity>
              )}
              {tab === "mutual" && (
                <TouchableOpacity style={[styles.chatBtn, { backgroundColor: C.primary }]} onPress={() => router.push(`/chat/${item.id}` as any)}>
                  <MaterialIcons name="chat-bubble" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="favorite-border" size={48} color={C.textLight} />
              <Text style={[styles.emptyTitle, { color: C.text }]}>아직 없습니다</Text>
              <Text style={[styles.emptyDesc, { color: C.textSecondary }]}>
                {tab === "received" ? "프로필을 더 꾸며보세요" : tab === "sent" ? "피드에서 관심을 보내보세요" : "상호 관심이 성립되면 여기에 표시됩니다"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  topTitle: { fontSize: 18, fontWeight: "700" },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 6,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  loader: { marginTop: 40 },
  list: { paddingHorizontal: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  verifiedDot: {
    position: "absolute",
    bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2,
  },
  info: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nickname: { fontSize: 16, fontWeight: "700" },
  meta: { fontSize: 13, marginTop: 3 },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  acceptText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  chatBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
});
