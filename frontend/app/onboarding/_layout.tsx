import { Stack } from "expo-router";
import { useThemeColors } from "../../src/hooks/useThemeColors";

export default function OnboardingLayout() {
  const C = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "뒤로",
        headerTitleStyle: { fontWeight: "600", color: C.text },
        headerStyle: { backgroundColor: C.background },
        headerTintColor: C.text,
      }}
    >
      <Stack.Screen name="intro" options={{ title: "서비스 소개", headerShown: false }} />
      <Stack.Screen name="phone" options={{ title: "본인확인" }} />
      <Stack.Screen name="verify" options={{ title: "인증코드 확인" }} />
      <Stack.Screen name="invite" options={{ title: "가입 방법" }} />
      <Stack.Screen name="profile" options={{ title: "프로필 작성" }} />
      <Stack.Screen name="survey" options={{ title: "가치관 설문" }} />
      <Stack.Screen name="preference" options={{ title: "관심 조건 설정" }} />
      <Stack.Screen name="email-verify" options={{ title: "직장/학교 인증" }} />
      <Stack.Screen name="mbti" options={{ title: "MBTI 설정" }} />
    </Stack>
  );
}
