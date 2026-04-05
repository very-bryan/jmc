# JMC 진만추 개발 세션 로그

## 세션 정보
- **날짜**: 2026-04-05
- **프로젝트**: JMC 진만추 (진지한 만남 추구)
- **스택**: Rails 8 API + React Native (Expo Router) + PostgreSQL
- **배포**: VeryCloud (jmc-backend.verycloud.io)

---

## 작업 내역 (시간순)

### 1. UI/UX 개선

#### 커스텀 모달 시스템
- `ConfirmModal` + `ResultToast` 컴포넌트 생성
- React Native 기본 `Alert.alert` 28개 전부 커스텀 모달로 교체
- ResultToast에 success/error/info 3가지 타입 추가
- ConfirmModal에 단일 버튼 모드 (cancelText="" 시 취소 버튼 숨김)

#### 채팅 화면 개선
- 말풍선 색상 반전: 내 메시지 흰색(오른쪽), 상대방 보라색(왼쪽)
- 대화 목록에서 사진 링크 → "사진을 보냈습니다." 표시
- 채팅 헤더에 ... 메뉴 추가 (신고/차단)
- 메시지 전송 실패 시 에러 토스트 추가

#### 다크모드
- `useThemeColors()` 훅 생성 (시스템 색상 자동 감지)
- 다크 팔레트: 배경 #121218, 서피스 #1C1C24
- 설정에서 시스템/라이트/다크 수동 선택 (themeStore + AsyncStorage)
- 모든 탭 화면, 채팅, 프로필, 피드카드, 모달에 적용
- 온보딩 화면 (phone, verify, invite, profile, survey, preference, email-verify) 전부 적용
- OnboardingLayout 다크모드 그라데이션 + GlassCard 다크 tint
- 온보딩 헤더 다크모드 적용
- ThemeProvider로 Navigation 전체 테마 적용
- Stack contentStyle + Tabs sceneStyle로 전환 배경 설정
- app.json: userInterfaceStyle "automatic" + 다크 스플래시
- 화면 전환 animation: "fade"로 흰색 번쩍임 최소화
- iOS/Android 네이티브 backgroundColor 다크 설정 (빌드 시 적용)

#### 게시글 작성
- 중복 타이틀 제거, 게시 버튼을 탭 헤더 우측으로 이동
- postSubmitRef 패턴으로 탭 헤더에서 PostScreen submit 호출

#### 로그아웃
- 네비게이션 스택 전체 리셋 후 스플래시로 이동
- Alert → ConfirmModal로 교체

#### 본인확인/인증코드 화면
- 가운데 정렬 → 위쪽 정렬 (paddingTop: 60)
- KeyboardAvoidingView 추가 (iOS 키보드 대응)

#### 프로필 에러 처리
- 프로필 조회 실패 시 상세 에러 메시지 모달로 표시
- 서버 메시지 그대로 표시 (졸업/정지/차단 구분)

---

### 2. 졸업 기능

- 졸업 상대 선택 화면 (대화 목록에서 선택)
- 혼자 졸업 옵션 (다른 곳에서 만난 분)
- 졸업 확인 모달 (계정 비활성화 경고 포함)
- 졸업 신청 대기 화면 (상대방 수락 대기)
- 졸업 완료 축하 화면 (Lottie 콘페티 애니메이션)
- 프로필 "N님과 졸업" 버튼 연동
- 마이페이지 졸업카드 연동
- 백엔드: solo_graduation 엔드포인트 + active 상태 검증

---

### 3. MBTI 궁합

- User 모델에 mbti, show_mbti 컬럼 추가
- MbtiCompatibilityService: 16x16 궁합 매트릭스 (5단계)
- MBTI 설정 화면 (16타입 그룹별 선택 + 공개 토글)
- MbtiCompatBadge 컴포넌트 (궁합 색상 뱃지)
- 피드카드 + 프로필 상세에 MBTI + 궁합 표시
- show_mbti=false면 양쪽 다 안 보임 (공평)

---

### 4. 설정 미구현 항목 구현

- **방해금지 모드**: 22:00~08:00 알림 차단 토글
- **프로필 공개 설정**: 프로필 노출 on/off 토글
- **프로필 비활성화**: 확인 모달 → dormant 상태 → 자동 로그아웃
- **도움말 센터**: FAQ 7개 항목 + 문의 이메일
- **안전 가이드라인**: 8개 안전 수칙 + 긴급연락처 (112, 1366)
- 백엔드: deactivate/reactivate API 추가

---

### 5. 엔지니어링 리뷰 (/plan-eng-review)

#### 보안 수정 (총 23건)

**인증/인가:**
- JWT 만료 24시간 → 7일 연장
- JWT 하드코딩 폴백 시크릿 제거
- rack-attack 추가 (인증 5회/분, 일반 60회/분, 관리자 3회/분)
- 사용자별 JWT rate limit (관심/차단/신고 30회/분)
- 사전등록 rate limit (IP당 시간당 5회)
- is_seed 클라이언트 우회 차단 (마스터코드로만 판별)
- 정지/졸업 유저 API 차단 (application_controller 상태 체크)
- 카카오 ID 탈취 방지 (서버에서 토큰 검증 후에만 설정)

**데이터 보호:**
- CORS 와일드카드 → 실제 도메인만 허용
- 뱃지 위변조 차단 (protect_verification_fields 콜백)
- 신고 시 메시지 RLS (자신의 대화 메시지만 신고 가능)
- 차단 유저 좋아요 차단
- Post#show 차단 유저 필터링 추가
- Post 이미지 URL 주입 방지 (S3 URL만 허용)
- message_type 조작 방지 (text/image만 허용)
- 유저 ID 열거 방지 (차단도 404 통일)
- 전화번호 열거 방지 (응답에서 phone 제거)
- user_response에서 is_seed_user/paid 필드 제거
- 로그 필터에 phone/kakao_token/base64 추가
- 인증 로그에서 전화번호 마스킹 (***5678)

**파일 업로드:**
- 파일 타입/크기 검증 (매직바이트 + 10MB + Content-Type)
- 업로드 폴더 path traversal 방지 (허용 목록)
- 이미지 변환 커맨드 인젝션 방어 (Shellwords.escape)

**동시성/무결성:**
- Interest accept: lock + find_or_create_by로 중복 Match 방지
- 초대코드 동시 사용 방지 (with_lock)
- 초대코드 중복 발급 방지 (with_lock)
- Relationship 활성 관계 중복 생성 차단
- Relationship confirm 트랜잭션 + lock
- 관계 종료 시 양쪽 유저 상태 올바르게 복귀
- 정지/졸업 유저 관계 종료로 active 복귀 방지

**WebSocket:**
- 구독 시 conversation_id 고정 (변조 방지)
- 메시지 전송 시 참여자 재검증

**인프라:**
- S3 내부 IP 응답에서 제거 (S3_PUBLIC_URL ENV 사용)
- 에러 응답에서 내부 인프라 정보 제거
- Admin LIKE 와일드카드 이스케이프 (sanitize_sql_like)
- 게시글 일일 10개 제한

#### Admin 패널 보안
- require_role! 전체 컨트롤러에 적용
- 비밀번호 최소 8자 검증
- 시드 비밀번호 ENV 적용 (ADMIN_PASSWORD)
- 세션 타임아웃 30분
- 세션 고정 공격 방어 (reset_session)
- 전화번호 검색 super_admin만 허용
- 관리자 로그인 rate limit

#### 성능
- 피드 N+1 쿼리 해결 (liked 체크 20회 → 1회)

#### 테스트
- RSpec 22개 테스트 (인증, 관심, 졸업, 차단)
- factory_bot 팩토리 (users, posts, invite_codes)
- rack-attack 테스트 환경 비활성화

---

### 6. CSO 보안 감사 (/cso)

- CORS 와일드카드, JWT 폴백 → 수정 완료
- is_seed 우회, 게시글 제한, 인증 로깅 → 수정 완료
- 이미지 커맨드 인젝션 → Shellwords.escape 적용

---

### 7. QA 테스트 (/qa)

- 백엔드 RSpec 22/22 통과
- 프론트엔드 TypeScript 0 에러
- 빈 catch 블록 수정 (관심 수락, 메시지 전송)
- 피드 API 실패 시 더미 데이터 폴백

---

### 8. 코드 품질 (/health)

- 종합 점수: 10.0 / 10
- TypeScript: 10/10 (0 에러)
- Brakeman: 10/10 (0 경고)
- RSpec: 10/10 (22/22 통과)

---

### 9. Codex 독립 리뷰 (/codex)

- Interest/Match 레이스 컨디션 발견 → 수정
- Relationship 상태 무결성 문제 발견 → 수정
- 초대코드 동시성 문제 발견 → 수정
- 다크모드 흰색 번쩍임 분석 → contentStyle + sceneStyle + ThemeProvider 적용

---

### 10. 배포

- VeryCloud 백엔드 다수 배포
- Docker 캐시 무효화 (ARG CACHE_BUST)
- rack-attack MemoryStore 폴백 (500 에러 해결)
- docker-entrypoint: db:prepare → db:migrate
- 로컬 APK 빌드 성공 (jinmanchu.apk, 72MB)

---

### 11. 문서 작성

- **SECURITY_ROADMAP.md**: 3단계 보안 로드맵 (론칭→1,000명→10,000명 마이크로서비스)
- **SECURITY_CHECKLIST.md**: 21개 카테고리, 116개 보안 점검 항목
- **INTEGRATION_GUIDE.md**: 카카오 로그인 + 휴대폰 인증 + 인앱결제 연동 가이드

---

## 현재 상태

### 완료된 기능
- 온보딩 (소개, 본인확인, 초대코드, 프로필, 가치관, 검색필터, 이메일인증)
- 피드 (게시글 조회, 좋아요, 공유, 신고/차단)
- 채팅 (실시간 대화, 이미지 전송, 신고/차단)
- 관심 (보내기/수락/거절, 상호관심→매칭)
- 프로필 (조회, 졸업 신청)
- 알림 (관심, 상호관심, 시스템 공지)
- 졸업 (상대 선택/혼자 졸업/콘페티 축하)
- MBTI 궁합 (16x16 매트릭스, 피드/프로필 표시)
- 다크모드 (시스템 연동 + 수동 선택)
- 설정 (개인정보, 매칭설정, 알림, 공개설정, 비활성화, 도움말, 안전가이드)
- 관리자 패널 (유저관리, 신고처리, 통계, 역할기반 접근제어)

### 론칭 전 필요 작업
- [ ] 사업자 등록
- [ ] 카카오 로그인 실제 연동
- [ ] 카카오 본인인증 (실명/생년월일/전화번호)
- [ ] 인앱결제 (Apple/Google)
- [ ] 개인정보 처리방침 작성
- [ ] 앱스토어 심사 제출
- [ ] 프로덕션 관리자 비밀번호 변경

### 기술 부채
- [ ] SMS 인증 실제 연동 (현재 123456 고정)
- [ ] 결제 검증 실제 연동 (현재 아무 값 통과)
- [ ] 셀피 인증 실제 연동 (현재 API 호출만으로 통과)
- [ ] ActionCable 프로덕션 설정 (Redis 필요)
- [ ] 푸시 알림 (FCM/APNs)
- [ ] Expo Go 다크모드 흰색 번쩍임 (빌드 시 해결됨)
