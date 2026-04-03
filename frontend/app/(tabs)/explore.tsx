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
import { interestApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { VerificationBadge } from "../../src/components/VerificationBadge";
import { COLORS } from "../../src/constants/config";
import type { Interest } from "../../src/types";

type Tab = "sent" | "received" | "mutual";

const DUMMY_INTERESTS: Interest[] = [
  { id: 701, status: "pending", user: { id: 2, nickname: "지은", age: 29, region: "서울", profile_image_url: null, verification_level: "profile_verified" }, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 702, status: "pending", user: { id: 6, nickname: "성민", age: 33, region: "부산", profile_image_url: null, verification_level: "selfie_verified" }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: 703, status: "pending", user: { id: 7, nickname: "예진", age: 27, region: "서울", profile_image_url: null, verification_level: "fully_verified" }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: 704, status: "accepted", user: { id: 3, nickname: "수현", age: 28, region: "경기", profile_image_url: null, verification_level: "profile_verified" }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

export default function ExploreScreen() {
  const router = useRouter();
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
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(["received", "sent", "mutual"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => fetchInterests(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "received" ? "나를 본 사람" : t === "sent" ? "보낸 관심" : "상호 관심"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={interests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/profile/${item.user.id}` as any)}
            >
              <Image
                source={{ uri: `https://i.pravatar.cc/150?img=${(item.user.id % 10) + 1}` }}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.nickname}>{item.user.nickname}</Text>
                  <VerificationBadge level={item.user.verification_level} />
                </View>
                <Text style={styles.meta}>
                  {item.user.age}세 · {item.user.region}
                </Text>
              </View>
              {tab === "received" && item.status === "pending" && (
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(item.id)}
                >
                  <Text style={styles.acceptText}>수락</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>아직 없습니다</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  loader: { marginTop: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
  },
  info: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nickname: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  acceptText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", padding: 40 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
