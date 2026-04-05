# JMC 보안 로드맵

## Phase 1: 론칭 전 (유저 0명)

- [x] CORS 와일드카드 제거 → 실제 도메인만 허용
- [x] JWT 하드코딩 폴백 제거
- [x] rack-attack 레이트 리밋 추가 (인증 5회/분)
- [x] is_seed 클라이언트 우회 차단
- [x] 게시글 일일 10개 제한
- [x] 인증 시도 로깅
- [x] 이미지 업로드 커맨드 인젝션 방어 (Shellwords.escape)
- [x] Interest/Match 레이스 컨디션 방지 (lock + find_or_create_by)
- [x] Relationship 상태 무결성 (양쪽 복귀, 중복 관계 차단)
- [x] 초대코드 동시 사용 방지 (with_lock)
- [ ] 개인정보 처리방침 작성 + 앱 내 동의 화면
- [ ] 탈퇴/졸업 시 데이터 삭제 로직
- [ ] 관리자 데이터 접근 로깅

## Phase 2: 유저 1,000명 돌파

### 전화번호 해싱
- [ ] users.phone → users.phone_hash (SHA-256 + salt) 마이그레이션
- [ ] users.phone_last4 추가 (표시용 "***5678")
- [ ] users.encrypted_phone 추가 (복호화 필요 시 AES-256, 키는 ENV)
- [ ] 인증 플로우: phone → hash 비교로 변경
- [ ] 기존 평문 phone 컬럼 삭제

### 메시지 암호화
- [ ] messages.content → AES-256-GCM 서버사이드 암호화
- [ ] 암호화 키는 ENV 또는 KMS에서 관리
- [ ] 기존 메시지 일괄 암호화 마이그레이션
- [ ] 검색 필요 시 blind index 추가

### DB 스키마 분리 (같은 PostgreSQL, 다른 스키마)
- [ ] auth_credentials 스키마: phone_hash, password_hash, encrypted_phone
- [ ] profiles 스키마: user_token(UUID), nickname, age, region, occupation, photo
- [ ] preferences 스키마: user_token(UUID), value_survey, preference_filter
- [ ] user_token_map 테이블: user_id ↔ user_token 매핑 (별도 암호화 키)
- [ ] 각 스키마별 DB 유저 권한 분리 (auth 스키마 접근은 auth 유저만)

### 데이터 자동 삭제
- [ ] 졸업 유저: 90일 후 프로필 상세 + 메시지 자동 삭제 (cron job)
- [ ] 탈퇴 유저: 즉시 개인정보 삭제, 30일 후 완전 파기
- [ ] 끝난 대화: 매칭 종료 30일 후 메시지 내용 삭제
- [ ] 채팅 사진: 전송 후 90일 S3에서 자동 삭제

### 관리자 보안 강화
- [ ] 관리자 유저 데이터 조회 시 접근 로그 기록 (누가 언제 누구를 봤는가)
- [ ] 관리자 2FA (TOTP) 추가
- [ ] 관리자 세션 타임아웃 (30분)

## Phase 3: 유저 10,000명 돌파 → 마이크로서비스 분리

### 컨테이너 3개 분리

```
[API Gateway / Load Balancer]
        │
  ┌─────┼─────────────────┐
  │     │                 │
  ▼     ▼                 ▼
[인증]  [프로필]          [취향]
  │      │                │
  ▼      ▼                ▼
[Auth DB] [Profile DB] [Preference DB]
```

### 인증 서비스 (auth-service)
- 담당: 로그인, 회원가입, JWT 발급, 전화번호 인증
- DB: phone_hash, password_hash, encrypted_phone, jwt_refresh_tokens
- 포트: 내부 전용 (외부 직접 접근 불가)
- 기술: Rails API 또는 Go (성능 우선 시)

### 프로필 서비스 (profile-service)
- 담당: 프로필 CRUD, 사진 업로드, 피드, 게시글
- DB: profiles, posts, post_images, blocks, reports
- 연결: user_token으로만 식별 (전화번호 모름)
- 기술: Rails API

### 취향 서비스 (preference-service)
- 담당: 가치관 설문, 매칭 필터, 매칭 알고리즘
- DB: value_surveys, preference_filters, interests, matches
- 연결: user_token으로만 식별 (이름, 전화번호 모름)
- 기술: Rails API 또는 Python (ML 매칭 알고리즘 시)

### 서비스 간 통신
- [ ] 내부 통신: gRPC 또는 REST (mTLS 암호화)
- [ ] 서비스 디스커버리: Docker Compose network 또는 K8s service
- [ ] API Gateway: 외부 요청을 적절한 서비스로 라우팅
- [ ] Circuit breaker: 하나 죽어도 나머지는 동작

### 배포
- [ ] Docker Compose (3 서비스 + 3 DB)로 시작
- [ ] 유저 50,000+ 시 Kubernetes 전환 검토
- [ ] 각 서비스 독립 배포 가능 (CI/CD 파이프라인 분리)
- [ ] DB 백업도 서비스별 분리 (한 백업에 전체 데이터 없음)

### 마이그레이션 순서
1. 취향 서비스 먼저 분리 (가장 독립적, 다른 서비스 의존 적음)
2. 인증 서비스 분리 (JWT 발급 로직 이관)
3. 프로필 서비스 분리 (나머지 전부)
4. 모놀리스 서버 종료

### 보안 효과
```
공격 시나리오별 유출 범위
════════════════════════════════════════════════
시나리오              현재(모놀리스)    분리 후
─────────────────    ──────────────   ──────────
Auth DB 유출         전체 유출         해시된 전화번호만
Profile DB 유출      전체 유출         닉네임+나이 (전화번호 없음)
Preference DB 유출   전체 유출         취향 정보만 (누군지 모름)
서버 1개 해킹        전체 유출         해당 서비스 데이터만
백업 파일 유출       전체 유출         해당 DB 데이터만
════════════════════════════════════════════════
```

## 참고: 한국 개인정보보호법(PIPA) 필수 사항

- [ ] 개인정보 처리방침 공개 (앱 내 + 웹)
- [ ] 수집/이용 동의 획득 (가입 시)
- [ ] 제3자 제공 동의 (카카오 연동)
- [ ] 파기 정책 명시 (목적 달성 시 즉시 파기)
- [ ] 개인정보 보호책임자 지정
- [ ] 개인정보 영향평가 (유저 5만명+ 시)
