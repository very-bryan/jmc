import { Platform } from "react-native";

const UMAMI_URL = "https://jmc-umami.verycloud.io";
const WEBSITE_ID = ""; // Umami 대시보드에서 웹사이트 추가 후 ID 입력

// ──────────────────────────────────────────
// 이벤트 이름 상수 (아하모먼트 퍼널 기준)
// ──────────────────────────────────────────

export const EVENTS = {
  // ── 온보딩 퍼널 ──
  ONBOARDING_START: "onboarding_start",               // 시작하기 클릭
  PHONE_VERIFY_REQUEST: "phone_verify_request",        // 인증코드 요청
  PHONE_VERIFY_COMPLETE: "phone_verify_complete",      // 본인인증 완료
  SELFIE_VERIFY_COMPLETE: "selfie_verify_complete",    // 셀피 인증 완료
  PROFILE_COMPLETE: "profile_complete",                // 프로필 작성 완료
  SURVEY_COMPLETE: "survey_complete",                  // 가치관 설문 완료
  PREFERENCE_COMPLETE: "preference_complete",          // 조건 설정 완료
  REGISTRATION_COMPLETE: "registration_complete",      // 전체 가입 완료

  // ── 로그인 ──
  LOGIN_SUCCESS: "login_success",                      // 기존 유저 로그인

  // ── 탐색 (초기 아하: "괜찮은 사람이 보인다") ──
  FEED_VIEW: "feed_view",                              // 피드 조회
  FEED_SCROLL: "feed_scroll",                          // 피드 스크롤 (페이지 로드)
  PROFILE_VIEW: "profile_view",                        // 프로필 상세 열람
  PROFILE_VIEW_MILESTONE: "profile_view_milestone",    // N개 프로필 열람 마일스톤

  // ── 관심 (상호성 아하: "연결될 수 있겠다") ──
  INTEREST_SEND: "interest_send",                      // 관심 보내기
  INTEREST_RECEIVE: "interest_receive",                // 관심 받기 (푸시/확인)
  INTEREST_ACCEPT: "interest_accept",                  // 관심 수락
  INTEREST_DECLINE: "interest_decline",                // 관심 거절
  MUTUAL_INTEREST: "mutual_interest",                  // 상호 관심 성립 ★

  // ── 대화 (관계 아하: "진짜 대화가 된다") ──
  DM_START: "dm_start",                                // 첫 DM 전송
  DM_SEND: "dm_send",                                  // 메시지 발신
  DM_RECEIVE: "dm_receive",                            // 메시지 수신
  DM_CONVERSATION_OPEN: "dm_conversation_open",        // 대화방 진입
  DM_5_TURNS: "dm_5_turns",                            // 5턴 대화 달성 ★★
  DM_10_TURNS: "dm_10_turns",                          // 10턴 대화 달성
  DM_MULTI_DAY: "dm_multi_day",                        // 2일 이상 이어진 대화

  // ── 관계 전환 ──
  RELATIONSHIP_REQUEST: "relationship_request",        // 연애 시작 요청
  RELATIONSHIP_CONFIRM: "relationship_confirm",        // 연애 시작 확인
  GRADUATION_REQUEST: "graduation_request",            // 졸업 신청
  GRADUATION_CONFIRM: "graduation_confirm",            // 졸업 확인

  // ── 안전 / 이탈 신호 ──
  REPORT_SUBMIT: "report_submit",                      // 신고
  BLOCK_USER: "block_user",                            // 차단
  ACCOUNT_DEACTIVATE: "account_deactivate",            // 휴면/탈퇴
} as const;

// ──────────────────────────────────────────
// 트래킹 함수
// ──────────────────────────────────────────

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
    // 무시
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
          data: {
            ...data,
            platform: Platform.OS,
            timestamp: new Date().toISOString(),
          },
          language: "ko-KR",
          screen: `${Platform.OS}`,
        },
      }),
    });
  } catch {
    // 무시
  }
}
