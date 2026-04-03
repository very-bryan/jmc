import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const UMAMI_URL = "https://jmc-umami.verycloud.io";
const WEBSITE_ID = ""; // Umami 대시보드에서 웹사이트 추가 후 ID 입력

let sessionId: string | null = null;

async function getSessionId(): Promise<string> {
  if (sessionId) return sessionId;

  let stored = await AsyncStorage.getItem("umami_session_id");
  if (!stored) {
    stored = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await AsyncStorage.setItem("umami_session_id", stored);
  }
  sessionId = stored;
  return stored;
}

export async function trackPageView(path: string, title?: string) {
  if (!WEBSITE_ID) return;

  try {
    await fetch(`${UMAMI_URL}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "event",
        payload: {
          website: WEBSITE_ID,
          url: path,
          title: title || path,
          language: "ko-KR",
          screen: `${Platform.OS}`,
        },
      }),
    });
  } catch {
    // 트래킹 실패는 무시
  }
}

export async function trackEvent(
  eventName: string,
  data?: Record<string, string | number>
) {
  if (!WEBSITE_ID) return;

  try {
    await fetch(`${UMAMI_URL}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "event",
        payload: {
          website: WEBSITE_ID,
          url: "/app",
          name: eventName,
          data,
          language: "ko-KR",
          screen: `${Platform.OS}`,
        },
      }),
    });
  } catch {
    // 트래킹 실패는 무시
  }
}
