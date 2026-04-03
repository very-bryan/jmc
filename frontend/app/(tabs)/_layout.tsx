import { Tabs } from "expo-router";
import { Text } from "react-native";
import { COLORS } from "../../src/constants/config";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: { paddingBottom: 4, height: 56 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "탐색",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "작성",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>✏️</Text>,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "DM",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
