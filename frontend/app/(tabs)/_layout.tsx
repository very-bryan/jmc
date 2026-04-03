import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/config";

export default function TabsLayout() {
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
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <Text style={styles.headerBrand}>진만추</Text>,
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name={focused ? "home" : "home"} size={28} color={color} />
              {focused && <View style={styles.tabDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          headerTitle: "탐색",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              <MaterialIcons name="search" size={28} color={color} />
              {focused && <View style={styles.tabDot} />}
            </View>
          ),
        }}
      />
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: "center", gap: 3 },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary },
  headerBrand: { fontSize: 22, fontWeight: "800", fontStyle: "italic", color: COLORS.primary },
  plusWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: "center", alignItems: "center",
  },
  plusWrapActive: { backgroundColor: COLORS.primary },
});
