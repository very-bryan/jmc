import React, { useEffect, useState, useCallback } from "react";
// @ts-ignore
import { MaterialIcons } from "@expo/vector-icons";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { feedApi, interestApi } from "../../src/api";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { FeedCard } from "../../src/components/FeedCard";
import { COLORS } from "../../src/constants/config";
import type { Post } from "../../src/types";

const DUMMY_POSTS: Post[] = [
  {
    id: 801, content: "한강에서 저녁 러닝 완료. 오늘 날씨 최고였어요. 러닝 후 맥주 한 잔의 여유.", mood_tag: "운동",
    visibility: "public_post", images: [], created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: { id: 2, nickname: "지은", age: 29, region: "서울", profile_image_url: null, verification_level: "profile_verified" },
  },
  {
    id: 802, content: "새로 산 필름 카메라로 찍은 첫 롤. 현상 기다리는 이 설렘이 디지털에는 없죠.", mood_tag: "취미",
    visibility: "public_post", images: [], created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: { id: 3, nickname: "민수", age: 31, region: "서울", profile_image_url: null, verification_level: "selfie_verified" },
  },
  {
    id: 803, content: "퇴근 후 혼자 요리하는 시간이 하루 중 제일 좋아요. 오늘은 감바스.", mood_tag: "요리",
    visibility: "public_post", images: [], created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    user: { id: 5, nickname: "수현", age: 28, region: "경기", profile_image_url: null, verification_level: "profile_verified" },
  },
  {
    id: 804, content: "주말 북한산 등산. 정상에서 보는 서울이 참 예뻤습니다.", mood_tag: "여행",
    visibility: "public_post", images: [], created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    user: { id: 4, nickname: "준호", age: 32, region: "서울", profile_image_url: null, verification_level: "fully_verified" },
  },
  {
    id: 805, content: "요즘 읽고 있는 책: 이기적 유전자. 진화 심리학 관점에서 연애를 보면 재밌어요.", mood_tag: "독서",
    visibility: "public_post", images: [], created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user: { id: 7, nickname: "하은", age: 30, region: "인천", profile_image_url: null, verification_level: "phone_verified" },
  },
];

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      const res = await feedApi.get(pageNum);
      const newPosts = res.data?.posts || [];
      const data = newPosts.length > 0 ? newPosts : (pageNum === 1 ? DUMMY_POSTS : []);

      if (refresh) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      setHasMore(newPosts.length >= 20);
      setPage(pageNum);
      if (refresh || pageNum === 1) {
        trackEvent(EVENTS.FEED_VIEW);
      } else {
        trackEvent(EVENTS.FEED_SCROLL, { page: pageNum });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1, true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed(1, true);
  };

  const onEndReached = () => {
    if (hasMore && !loading) {
      fetchFeed(page + 1);
    }
  };

  const handleInterest = async (userId: number) => {
    try {
      await interestApi.create(userId);
      trackEvent(EVENTS.INTEREST_SEND, { target_user_id: userId });
    } catch {
      // already sent or blocked
    }
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <FeedCard post={item} onInterest={() => handleInterest(item.user.id)} />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>내 조건</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>25-30</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>서울</Text>
            </View>
            <View style={[styles.chip, styles.chipActive]}>
              <Text style={[styles.chipText, styles.chipTextActive]}>인증됨</Text>
            </View>
            <TouchableOpacity style={styles.chipAdjust}>
              <MaterialIcons name="tune" size={14} color={COLORS.primary} />
              <Text style={styles.chipAdjustText}> 조정</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>--</Text>
          <Text style={styles.emptyText}>아직 피드가 없습니다</Text>
          <Text style={styles.emptySubtext}>관심 조건을 넓혀보세요</Text>
        </View>
      }
      contentContainerStyle={posts.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  filterBar: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  filterScroll: { flexDirection: "row" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 8,
    backgroundColor: COLORS.accentLight,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  chipTextActive: { color: COLORS.primary, fontWeight: "700" },
  chipAdjust: { paddingHorizontal: 14, paddingVertical: 7 },
  chipAdjustText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
  empty: { alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12, color: COLORS.textLight },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
