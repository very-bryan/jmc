# JMC 진만추 디자인 시스템

## 브랜드

- **서비스명**: 진만추 (진지한 만남 추구)
- **로고**: `frontend/assets/logo.png` (jin♡manchu 필기체)
- **슬로건**: "소개팅앱보다 진지하게, 일상으로 알아가는 진짜 관계"

## 컬러

| 토큰 | 값 | 용도 |
|------|-----|------|
| `primary` | `#9C86FF` | 메인 보라. 버튼, 아이콘, 강조 |
| `primaryLight` | `#EDE8FF` | 연보라 배경, 태그 |
| `primaryDark` | `#7B68CC` | 눌림 상태 |
| `primaryGradientEnd` | `#B8A5FF` | 그라디언트 끝점 |
| `background` | `#FFFFFF` | 기본 흰색 배경 |
| `surface` | `#f4f7f9` | 카드/섹션 배경 |
| `text` | `#1A1A2E` | 본문 텍스트 |
| `textSecondary` | `#6B7280` | 보조 텍스트 |
| `textLight` | `#9CA3AF` | 비활성/힌트 텍스트 |
| `border` | `#EEEFF2` | 구분선 |
| `accent` | `#9C86FF` | primary와 동일 |
| `accentLight` | `#F3F0FF` | 연한 보라 배경 |

### 온보딩/스플래시 전용 컬러

| 용도 | 값 |
|------|-----|
| 배경 그라디언트 | `#E8E0F0 → #F5F1EA → #F0E8E0 → #EDE8F5` |
| 장식 원 보라 | `#C9BFFF` opacity 0.5 |
| 장식 원 피치 | `#E5C0B0` opacity 0.4 |
| 장식 원 연보라 | `#B8A5FF` opacity 0.35 |
| 장식 원 올리브 | `#C9D4A0` opacity 0.3 |
| 카카오 버튼 | `#FEE500` |

## 타이포그래피

| 용도 | 크기 | 무게 | 색상 |
|------|------|------|------|
| 진만추 로고 텍스트 | 64px | 900 | `#9C86FF` |
| JINMANCHU 라벨 | 13px | 700 | `#9C86FF`, letterSpacing 4 |
| 히어로 타이틀 | 28px | 800 | `#fff` |
| 카드 넘버 (01, 02) | 48px | 800 | `#9C86FF`, opacity 0.3 |
| 카드 타이틀 | 20px | 700 | `#1a1a1a` |
| 카드 설명 | 15px | 400 | `#3a3a3a`, lineHeight 23 |
| 카드 타이틀 (작은) | 17px | 700 | `#1a1a1a` |
| 카드 설명 (작은) | 13px | 400 | `#3a3a3a`, lineHeight 19 |
| CTA 라벨 | 17px | 700 | `#2c2c2c` 또는 `text` |
| 버튼 텍스트 | 18px | 700 | `#fff` |

## 글래스모피즘

### GlassCard 컴포넌트

```
BlurView (intensity: 40, tint: "light")
  └─ LinearGradient
       colors: rgba(255,255,255,0.5) → rgba(255,255,255,0.15)
       direction: 좌상단 → 우하단
       └─ 콘텐츠
```

### 하이라이트 border (빛 반사 효과)

- **상단**: `rgba(255,255,255,0.5)`
- **좌측**: `rgba(255,255,255,0.3)`
- **하단**: `rgba(255,255,255,0.08)`
- **우측**: `rgba(255,255,255,0.08)`

### 글래스 배경 조건

- 밝은 파스텔 그라디언트 배경 위에서 사용
- 배경에 장식 원(deco circles)이 있어야 blur로 비치는 효과 발생
- 카드에 shadow 사용하지 않음 (안드로이드에서 border처럼 보임)

### 히어로 이미지 위 글래스

```
BlurView (intensity: 25, tint: "dark")
  └─ View (backgroundColor: rgba(255,255,255,0.15))
       └─ 텍스트 (흰색)
```

### 하단 고정 버튼 영역

```
BlurView (intensity: 60, tint: "light")
  └─ View (backgroundColor: rgba(255,255,255,0.35))
       └─ 버튼
```

## 라운딩

| 요소 | borderRadius |
|------|-------------|
| 히어로 이미지 | 32 |
| 글래스 카드 (큰) | 24 |
| 글래스 카드 (작은) | 24 |
| 졸업 카드 | 32 |
| CTA 버튼 | 28 (pill) |
| 일반 버튼 | 14~16 |
| 히어로 글래스 바 | 20 |

## 아이콘

- **라이브러리**: `@expo/vector-icons`의 `MaterialIcons`
- **스타일**: 모노톤 (outline 기본, filled는 활성 상태만)
- **이모지 사용 금지**: 모든 아이콘은 MaterialIcons로 통일

### 사용 중인 아이콘

| 위치 | 아이콘 이름 |
|------|-----------|
| 탭 홈 | `home` |
| 탭 검색 | `search` |
| 탭 작성 | `add` |
| 탭 메시지 | `chat-bubble-outline` / `chat` |
| 탭 마이 | `person-outline` / `person` |
| 피드 좋아요 | `favorite-border` |
| 피드 댓글 | `chat-bubble-outline` |
| 피드 공유 | `send` |
| 피드 더보기 | `more-horiz` |
| 설정 chevron | `chevron-right` |
| 카드 01 | `favorite` |
| 카드 02 | `verified-user` |
| 카드 03 | `forum` |
| 카드 04 | `auto-awesome` |
| 졸업 카드 | `school` |

## 이미지 처리

- 모든 이미지는 **WebP** 포맷으로 변환
- 가장 긴 변 **최대 2048px** (앱 내 에셋은 용도에 맞게 조정)
- 품질: **85**
- 변환 도구: `cwebp -q 85 -resize [width] 0 input -o output.webp`
- RustFS (S3 호환) 스토리지에 업로드

## 언어

- **앱 내 모든 텍스트는 한국어**
- 영어 사용 금지 (JINMANCHU 브랜드 라벨, GRADUATION 배지만 예외)
- 변수명/코드 내부는 영어 가능, 유저에게 보이는 텍스트만 한국어

## 레이아웃 규칙

- 좌우 패딩: 24px
- 카드 간 간격: 14px
- 히어로 상단 마진: 50px (상태바 겹침 방지)
- 하단 스크롤 여백: 120px (고정 버튼 겹침 방지)
- 이미지 비율: 원본 비율 유지 (`aspectRatio` 사용)
