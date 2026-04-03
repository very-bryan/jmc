import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Text,
} from "react-native";
import { feedApi, interestApi } from "../../src/api";
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>아직 피드가 없습니다</Text>
          <Text style={styles.emptySubtext}>관심 조건을 넓혀보세요</Text>
        </View>
      }
      contentContainerStyle={posts.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", padding: 40 },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
