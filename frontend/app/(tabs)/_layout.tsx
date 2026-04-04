import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { notificationApi } from "../../src/api";
import { COLORS } from "../../src/constants/config";

export default function TabsLayout() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      notificationApi.unreadCount()
        .then((res) => setUnreadCount(res.data?.unread_count || 0))
        .catch(() => setUnreadCount(3)); // 더미
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: COLORS.background,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTitleStyle: { fontWeight: "700", fontSize: 18, color: COLORS.text },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 0.5,
          borderTopColor: COLORS.border,
          height: 60,
          paddingTop: 6,
          justifyContent: "center",
        },
        tabBarItemStyle: {
          flex: 1,
        },
      }}
    >
      {/* 홈 */}
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Image
              source={require("../../assets/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push("/(tabs)/notifications")}
            >
              <MaterialIcons name="notifications-none" size={24} color={COLORS.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name="home" size={28} color={color} />
              {focused && <View style={styles.tabDot} />}
            </View>
          ),
        }}
      />

      {/* 관심 (하트) */}
      <Tabs.Screen
        name="explore"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name={focused ? "favorite" : "favorite-border"} size={26} color={color} />
              {focused && <View style={styles.tabDot} />}
            </View>
          ),
        }}
      />

      {/* 작성 */}
      <Tabs.Screen
        name="post"
        options={{
          headerTitle: "새 게시글",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.plusWrap, focused && styles.plusWrapActive]}>
              <MaterialIcons name="add" size={24} color={focused ? "#fff" : COLORS.textLight} />
            </View>
          ),
        }}
      />

      {/* 메시지 */}
      <Tabs.Screen
        name="messages"
        options={{
          headerTitle: "메시지",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name={focused ? "chat" : "chat-bubble-outline"} size={26} color={color} />
              {focused && <View style={styles.tabDot} />}
            </View>
          ),
        }}
      />

      {/* 마이 */}
      <Tabs.Screen
        name="mypage"
        options={{
          headerTitle: "설정",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name={focused ? "person" : "person-outline"} size={28} color={color} />
              {focused && <View style={styles.tabDot} />}
            </View>
          ),
        }}
      />

      {/* 알림 (탭바에서 완전히 숨김, 헤더 벨로 접근) */}
      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
          tabBarItemStyle: { display: "none", width: 0, height: 0 },
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: "center", gap: 3 },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary },
  headerLogo: { width: 220, height: 59, marginTop: 8 },
  headerBtn: { marginRight: 16, padding: 4, position: "relative" },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  plusWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: "center", alignItems: "center",
  },
  plusWrapActive: { backgroundColor: COLORS.primary },
});
