import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { notificationApi } from "../../src/api";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { postSubmitRef } from "../../src/store/postSubmitRef";

export default function TabsLayout() {
  const router = useRouter();
  const C = useThemeColors();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      notificationApi.unreadCount()
        .then((res) => setUnreadCount(res.data?.unread_count || 0))
        .catch(() => setUnreadCount(3));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: C.background },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textLight,
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: C.background,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTitleStyle: { fontWeight: "700", fontSize: 18, color: C.text },
        tabBarStyle: {
          backgroundColor: C.background,
          borderTopWidth: 0.5,
          borderTopColor: C.border,
          height: 80,
          paddingTop: 6,
          justifyContent: "center",
        },
        tabBarItemStyle: {
          flex: 1,
        },
      }}
    >
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
              <MaterialIcons name="notifications-none" size={24} color={C.text} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: C.primary, borderColor: C.background }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name="home" size={28} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name={focused ? "favorite" : "favorite-border"} size={26} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="post"
        options={{
          headerTitle: "새 게시글",
          headerRight: () => (
            <TouchableOpacity
              style={[styles.postHeaderBtn, { backgroundColor: C.primary }]}
              onPress={() => postSubmitRef.current?.submit()}
            >
              <Text style={styles.postHeaderBtnText}>게시</Text>
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.plusWrap, { backgroundColor: focused ? C.primary : C.surface }]}>
              <MaterialIcons name="add" size={24} color={focused ? "#fff" : C.textLight} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          headerTitle: "메시지",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name={focused ? "chat" : "chat-bubble-outline"} size={26} color={color} />
              {unreadCount > 0 && <View style={[styles.msgDot, { borderColor: C.background }]} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="mypage"
        options={{
          headerTitle: "설정",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name={focused ? "person" : "person-outline"} size={28} color={color} />
            </View>
          ),
        }}
      />

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
  tabIconWrap: { alignItems: "center", gap: 3, position: "relative" },
  msgDot: {
    position: "absolute",
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 1.5,
  },
  headerLogo: { width: 220, height: 59, marginTop: 8 },
  headerBtn: { marginRight: 16, padding: 4, position: "relative" },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  postHeaderBtn: {
    marginRight: 16,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 12,
  },
  postHeaderBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  plusWrap: {
    width: 36, height: 36, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
});
