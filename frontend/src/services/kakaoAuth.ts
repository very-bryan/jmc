import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import client from "../api/client";

// 카카오 개발자 콘솔에서 발급받은 REST API 키
const KAKAO_REST_API_KEY = ""; // TODO: 카카오 앱 등록 후 입력
const REDIRECT_URI = Linking.createURL("kakao-callback");

export async function loginWithKakao(): Promise<{
  success: boolean;
  isNewUser?: boolean;
  token?: string;
  user?: any;
  kakaoInfo?: any;
  error?: string;
}> {
  try {
    // 1. 카카오 OAuth 인증 페이지 열기
    const authUrl =
      `https://kauth.kakao.com/oauth/authorize?` +
      `client_id=${KAKAO_REST_API_KEY}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type !== "success" || !result.url) {
      return { success: false, error: "카카오 로그인이 취소되었습니다" };
    }

    // 2. redirect URL에서 authorization code 추출
    const url = new URL(result.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return { success: false, error: "인증 코드를 받지 못했습니다" };
    }

    // 3. code → access_token 교환 (카카오 서버에 직접)
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        code,
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return { success: false, error: "카카오 토큰 발급에 실패했습니다" };
    }

    // 4. access_token을 우리 서버에 전달
    const res = await client.post("/auth/kakao", {
      kakao_access_token: tokenData.access_token,
    });

    return {
      success: true,
      isNewUser: res.data.is_new_user,
      token: res.data.token,
      user: res.data.user,
      kakaoInfo: res.data.kakao_info,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.response?.data?.error || "카카오 로그인에 실패했습니다",
    };
  }
}
