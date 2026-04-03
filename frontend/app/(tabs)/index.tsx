import React, { useEffect, useState, useCallback } from "react";
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

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      const res = await feedApi.get(pageNum);
      const newPosts = res.data.posts;

      if (refresh) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
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
          <Text style={styles.filterLabel}>MY CONDITIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.chip}><Text style={styles.chipText}>26-35</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>서울</Text></View>
            <View style={[styles.chip, styles.chipActive]}><Text style={[styles.chipText, styles.chipTextActive]}>Verified</Text></View>
            <TouchableOpacity style={styles.chipAdjust}><Text style={styles.chipAdjustText}>Adjust</Text></TouchableOpacity>
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💑</Text>
          <Text style={styles.emptyText}>아직 피드가 없습니다</Text>
          <Text style={styles.emptySubtext}>관심 조건을 넓혀보세요</Text>
        </View>
      }
      contentContainerStyle={posts.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  filterBar: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  filterLabel: { fontSize: 11, fontWeight: "700", color: COLORS.textLight, letterSpacing: 0.5, marginBottom: 8 },
  filterScroll: { flexDirection: "row" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: COLORS.background,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.coralLight },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary },
  chipAdjust: { paddingHorizontal: 14, paddingVertical: 6 },
  chipAdjustText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
  empty: { alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
