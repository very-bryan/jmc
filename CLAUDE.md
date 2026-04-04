# JMC 진만추 프로젝트

## 프로젝트 구조

- `backend/` — Rails API (PostgreSQL, Action Cable)
- `frontend/` — React Native (Expo Router)
- `landing/` — Next.js 사전등록 랜딩페이지
- `umami/` — 별도 레포 (very-bryan/jmc_umami)

## 배포

| 서비스 | URL | 프레임워크 |
|--------|-----|-----------|
| 백엔드 | jmc-backend.verycloud.io | Rails |
| 랜딩 | jmc-landing.verycloud.io | Next.js |
| 분석 | jmc-umami.verycloud.io | Docker (Umami) |

## 디자인 시스템

**반드시 `DESIGN_SYSTEM.md`를 참고하세요.**

핵심 규칙:
- 메인 컬러: `#9C86FF` (보라)
- 아이콘: MaterialIcons 모노톤만 사용, 이모지 금지
- 유저에게 보이는 모든 텍스트는 한국어 (영어 금지)
- 이미지: WebP 변환, 최대 2048px, 품질 85
- 글래스모피즘: BlurView + LinearGradient 하이라이트 (DESIGN_SYSTEM.md 참고)

## 개발 서버

- 사용자가 직접 서버를 관리합니다
- 서버 자동 시작/재시작 금지
- 배포된 백엔드를 사용: `https://jmc-backend.verycloud.io`

## 테스트 계정

- 전화번호: 아무 번호, 인증코드: `123456`
- 초대코드: `ABC123`
- 관리자: admin@jmc.com / admin123
