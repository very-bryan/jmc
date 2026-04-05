# 외부 서비스 연동 가이드

카카오 로그인, 휴대폰 본인인증, 인앱결제 실제 구현 가이드.
현재 MVP 더미 로직을 실제 서비스로 교체하는 방법.

---

## 1. 카카오 로그인

### 필요한 것
- 카카오 개발자 계정: https://developers.kakao.com
- 앱 등록 후 **REST API 키** + **네이티브 앱 키** 발급

### 카카오 개발자 설정
1. https://developers.kakao.com/console/app 에서 앱 생성
2. **플랫폼 등록**
   - Android: 패키지명 `com.lowhigh7091.frontend` + 키 해시 등록
   - iOS: 번들 ID 등록
3. **카카오 로그인 활성화**: 내 애플리케이션 → 카카오 로그인 → 활성화
4. **동의 항목 설정**: 닉네임, 프로필 사진, 이메일, 성별 (선택)
5. **Redirect URI 등록**: `kakao{네이티브앱키}://oauth`

### 프론트엔드 구현

```bash
# Expo에서는 expo-auth-session + expo-web-browser 사용
npx expo install expo-auth-session expo-web-browser expo-crypto
```

**frontend/src/services/kakaoAuth.ts 수정:**
```typescript
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

const KAKAO_REST_API_KEY = "여기에_REST_API_키";
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "jmc",
  path: "kakao-callback",
});

export async function loginWithKakao() {
  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

  if (result.type === "success" && result.url) {
    const code = new URL(result.url).searchParams.get("code");
    if (code) {
      // 백엔드에 인가 코드 전송 → 백엔드에서 카카오 토큰 교환
      const res = await client.post("/auth/kakao", { code });
      return res.data;
    }
  }
  return null;
}
```

### 백엔드 구현

**backend/app/services/kakao_auth_service.rb 수정:**
```ruby
class KakaoAuthService
  KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
  KAKAO_USER_URL = "https://kapi.kakao.com/v2/user/me"

  def self.get_user_info_by_code(code, redirect_uri)
    # 1. 인가 코드로 액세스 토큰 교환
    token_res = HTTP.post(KAKAO_TOKEN_URL, form: {
      grant_type: "authorization_code",
      client_id: ENV["KAKAO_REST_API_KEY"],
      redirect_uri: redirect_uri,
      code: code
    })
    token_data = JSON.parse(token_res.body)
    access_token = token_data["access_token"]

    # 2. 액세스 토큰으로 유저 정보 조회
    user_res = HTTP.auth("Bearer #{access_token}")
                   .get(KAKAO_USER_URL)
    user_data = JSON.parse(user_res.body)

    {
      kakao_id: user_data["id"].to_s,
      nickname: user_data.dig("kakao_account", "profile", "nickname"),
      profile_image: user_data.dig("kakao_account", "profile", "profile_image_url"),
      email: user_data.dig("kakao_account", "email"),
      gender: user_data.dig("kakao_account", "gender")
    }
  end
end
```

**backend/app/controllers/api/v1/auth_controller.rb 수정:**
```ruby
# POST /api/v1/auth/kakao
def kakao_login
  code = params[:code]
  redirect_uri = params[:redirect_uri]

  kakao_info = KakaoAuthService.get_user_info_by_code(code, redirect_uri)
  return render json: { error: "카카오 인증에 실패했습니다" }, status: :unprocessable_entity unless kakao_info

  user = User.find_by(kakao_id: kakao_info[:kakao_id])

  if user
    token = JwtService.encode(user_id: user.id)
    render json: { token: token, user: user_response(user), is_new_user: false }
  else
    render json: { is_new_user: true, kakao_info: kakao_info }
  end
end
```

### 필요한 ENV 변수
```
KAKAO_REST_API_KEY=카카오_REST_API_키
KAKAO_NATIVE_APP_KEY=카카오_네이티브_앱_키
```

### app.json 설정
```json
{
  "expo": {
    "scheme": "jmc",
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": ["kakaokompassauth", "kakaolink"]
      }
    },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "data": [{ "scheme": "kakao{네이티브앱키}", "host": "oauth" }],
        "category": ["DEFAULT", "BROWSABLE"]
      }]
    }
  }
}
```

---

## 2. 휴대폰 본인인증 (SMS 인증)

### 선택지

| 서비스 | 가격 | 특징 |
|--------|------|------|
| NHN Cloud SMS | 건당 9.9원 | 가장 저렴, API 간단 |
| CoolSMS | 건당 20원 | 한국 대표, 문서 좋음 |
| Twilio | 건당 ~50원 | 글로벌, 비쌈 |
| Firebase Auth | 무료 (월 1만건) | 구글 계정 필요, 쉬움 |

**추천: Firebase Auth (Phone Authentication)**
- 무료 (월 10,000건)
- Expo에서 `expo-firebase-recaptcha` 지원
- 구글이 SMS 발송/검증 전부 처리
- 추가 서버 코드 최소

### Firebase Auth 구현

#### 1. Firebase 프로젝트 설정
1. https://console.firebase.google.com 에서 프로젝트 생성
2. Authentication → Sign-in method → Phone 활성화
3. Android 앱 등록: 패키지명 `com.lowhigh7091.frontend`
4. iOS 앱 등록: 번들 ID
5. `google-services.json` (Android), `GoogleService-Info.plist` (iOS) 다운로드

#### 2. 패키지 설치
```bash
npx expo install @react-native-firebase/app @react-native-firebase/auth
```

#### 3. 프론트엔드 구현
```typescript
import auth from "@react-native-firebase/auth";

// 인증코드 요청
async function requestCode(phone: string) {
  // +82 형식으로 변환
  const intlPhone = "+82" + phone.substring(1);
  const confirmation = await auth().signInWithPhoneNumber(intlPhone);
  return confirmation; // 이걸 저장해두고 verify에서 사용
}

// 인증코드 확인
async function verifyCode(confirmation: any, code: string) {
  const credential = await confirmation.confirm(code);
  // credential.user에 Firebase UID가 있음

  // 우리 백엔드에 Firebase 토큰 전송
  const idToken = await credential.user.getIdToken();
  const res = await client.post("/auth/verify_firebase", { id_token: idToken, phone });
  return res.data;
}
```

#### 4. 백엔드 구현
```ruby
# Gemfile에 추가
gem "firebase-admin-sdk"

# backend/app/controllers/api/v1/auth_controller.rb
def verify_firebase
  id_token = params[:id_token]

  # Firebase 토큰 검증
  decoded = FirebaseAdmin::Auth.verify_id_token(id_token)
  firebase_phone = decoded["phone_number"] # "+821012345678"

  # 우리 형식으로 변환
  phone = "0" + firebase_phone.gsub("+82", "")

  user = User.find_by(phone: phone)
  if user
    user.update_columns(phone_verified: true)
    token = JwtService.encode(user_id: user.id)
    render json: { token: token, user: user_response(user), is_new_user: false }
  else
    render json: { phone: phone, phone_verified: true, is_new_user: true }
  end
end
```

### 대안: NHN Cloud SMS (직접 구현)

Firebase가 싫다면 직접 SMS를 보내는 방법:

#### 1. NHN Cloud 가입 + SMS 서비스 활성화
- https://www.nhncloud.com
- Notification → SMS 서비스 활성화
- 발신번호 등록 (사업자 번호 필요)

#### 2. 백엔드 구현
```ruby
# backend/app/services/sms_service.rb
class SmsService
  NHN_API_URL = "https://api-sms.cloud.toast.com/sms/v3.0/appKeys/#{ENV['NHN_APP_KEY']}/sender/sms"

  def self.send_code(phone)
    code = rand(100000..999999).to_s

    # Redis에 인증코드 저장 (5분 만료)
    Rails.cache.write("sms_code:#{phone}", code, expires_in: 5.minutes)

    # SMS 발송
    HTTP.post(NHN_API_URL, json: {
      body: "[진만추] 인증번호 #{code}를 입력해주세요.",
      sendNo: ENV["SMS_SENDER_NUMBER"],
      recipientList: [{ recipientNo: phone }]
    }, headers: {
      "X-Secret-Key" => ENV["NHN_SECRET_KEY"]
    })

    true
  end

  def self.verify_code(phone, code)
    stored = Rails.cache.read("sms_code:#{phone}")
    stored.present? && stored == code
  end
end
```

#### 3. 컨트롤러 수정
```ruby
# request_code 수정
def request_code
  phone = params[:phone]
  unless phone&.match?(/\A01[016789]\d{7,8}\z/)
    return render json: { error: "유효하지 않은 전화번호입니다" }, status: :unprocessable_entity
  end

  SmsService.send_code(phone)
  render json: { message: "인증코드가 발송되었습니다" }
end

# verify_code 수정
def verify_code
  phone = params[:phone]
  code = params[:code]

  unless SmsService.verify_code(phone, code)
    return render json: { error: "인증코드가 일치하지 않습니다" }, status: :unprocessable_entity
  end

  # ... 나머지 로직 동일
end
```

### 필요한 ENV 변수 (NHN Cloud)
```
NHN_APP_KEY=NHN_클라우드_앱키
NHN_SECRET_KEY=NHN_시크릿키
SMS_SENDER_NUMBER=발신번호
```

---

## 3. 인앱결제 (IAP)

### 준비물
- Apple Developer 계정 ($99/년): https://developer.apple.com
- Google Play Developer 계정 ($25 일회): https://play.google.com/console

### 상품 등록

#### App Store Connect
1. 내 앱 → 인앱 구입 → 소모품 추가
2. 제품 ID: `com.jmc.signup.10000`
3. 가격: Tier 1 (₩1,100) 또는 직접 가격 설정 ₩10,000
4. 표시 이름: "진만추 가입"
5. 검수용 스크린샷 첨부

#### Google Play Console
1. 내 앱 → 수익 창출 → 인앱 상품 → 상품 만들기
2. 제품 ID: `jmc_signup_10000`
3. 가격: ₩10,000
4. 상품 이름: "진만추 가입"

### Expo 인앱결제 구현

expo-in-app-purchases는 deprecated. **react-native-iap** 사용:

```bash
npx expo install react-native-iap
```

**frontend/src/services/iap.ts 교체:**
```typescript
import { Platform } from "react-native";
import {
  initConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type ProductPurchase,
  type PurchaseError,
} from "react-native-iap";

const PRODUCT_ID = Platform.select({
  ios: "com.jmc.signup.10000",
  android: "jmc_signup_10000",
})!;

let isConnected = false;

export async function initIAP() {
  if (isConnected) return;
  try {
    await initConnection();
    isConnected = true;
  } catch (e) {
    console.warn("IAP init failed:", e);
  }
}

export async function purchaseSignup(): Promise<{
  success: boolean;
  receipt?: string;
  error?: string;
}> {
  try {
    await initIAP();

    // 상품 조회
    const products = await getProducts({ skus: [PRODUCT_ID] });
    if (!products.length) {
      return { success: false, error: "상품을 찾을 수 없습니다" };
    }

    // 구매 요청
    return new Promise((resolve) => {
      const purchaseListener = purchaseUpdatedListener(
        async (purchase: ProductPurchase) => {
          const receipt = purchase.transactionReceipt || purchase.purchaseToken;

          // 서버에 영수증 검증 요청
          try {
            await client.post("/auth/verify_purchase", {
              receipt,
              platform: Platform.OS,
              product_id: PRODUCT_ID,
            });
          } catch {}

          await finishTransaction({ purchase, isConsumable: true });
          purchaseListener.remove();
          errorListener.remove();
          resolve({ success: true, receipt: receipt || "" });
        }
      );

      const errorListener = purchaseErrorListener((error: PurchaseError) => {
        purchaseListener.remove();
        errorListener.remove();
        resolve({
          success: false,
          error: error.code === "E_USER_CANCELLED"
            ? "결제가 취소되었습니다"
            : "결제에 실패했습니다",
        });
      });

      requestPurchase({ sku: PRODUCT_ID });
    });
  } catch (e: any) {
    return { success: false, error: e.message || "결제 처리 중 오류" };
  }
}
```

### 백엔드 영수증 검증

**Gemfile 추가:**
```ruby
gem "google-apis-androidpublisher_v3"  # Google Play 영수증 검증
```

**backend/app/services/purchase_verification_service.rb:**
```ruby
class PurchaseVerificationService
  # Apple 영수증 검증
  def self.verify_apple(receipt)
    # Apple 서버에 영수증 검증 요청
    url = Rails.env.production?
      ? "https://buy.itunes.apple.com/verifyReceipt"
      : "https://sandbox.itunes.apple.com/verifyReceipt"

    res = HTTP.post(url, json: {
      "receipt-data" => receipt,
      "password" => ENV["APPLE_SHARED_SECRET"]
    })
    data = JSON.parse(res.body)

    data["status"] == 0  # 0 = 유효
  end

  # Google Play 영수증 검증
  def self.verify_google(purchase_token, product_id)
    require "google/apis/androidpublisher_v3"

    service = Google::Apis::AndroidpublisherV3::AndroidPublisherService.new
    service.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: StringIO.new(ENV["GOOGLE_SERVICE_ACCOUNT_JSON"]),
      scope: "https://www.googleapis.com/auth/androidpublisher"
    )

    result = service.get_product_purchase(
      ENV["GOOGLE_PACKAGE_NAME"],
      product_id,
      purchase_token
    )

    result.purchase_state == 0  # 0 = 구매 완료
  end
end
```

**backend/app/controllers/api/v1/auth_controller.rb에 추가:**
```ruby
# POST /api/v1/auth/verify_purchase
def verify_purchase
  receipt = params[:receipt]
  platform = params[:platform]
  product_id = params[:product_id]

  verified = case platform
  when "ios"
    PurchaseVerificationService.verify_apple(receipt)
  when "android"
    PurchaseVerificationService.verify_google(receipt, product_id)
  else
    false
  end

  if verified
    render json: { verified: true }
  else
    render json: { error: "결제 검증에 실패했습니다" }, status: :unprocessable_entity
  end
end
```

### 필요한 ENV 변수
```
APPLE_SHARED_SECRET=앱스토어_공유_시크릿
GOOGLE_PACKAGE_NAME=com.lowhigh7091.frontend
GOOGLE_SERVICE_ACCOUNT_JSON=구글_서비스_계정_JSON
```

### 테스트

#### iOS (Sandbox)
1. App Store Connect → 사용자 및 액세스 → Sandbox 테스터 계정 생성
2. 기기에서 기존 Apple ID 로그아웃 → Sandbox 계정으로 로그인
3. 인앱결제 시 실제 결제 안 됨 (Sandbox 환경)

#### Android (테스트)
1. Google Play Console → 테스트 → 내부 테스트 → 테스터 추가
2. 라이선스 테스트: Play Console → 설정 → 라이선스 테스트 → 이메일 추가
3. 테스트 카드로 결제 (실제 결제 안 됨)

---

## 구현 순서 (추천)

```
1단계: 카카오 로그인 (1일)
  - 카카오 개발자 앱 등록 + REST API 키 발급
  - 프론트: expo-auth-session으로 인가 코드 획득
  - 백엔드: 인가 코드 → 토큰 교환 → 유저 정보 조회
  - ENV: KAKAO_REST_API_KEY

2단계: 휴대폰 인증 (1일)
  - Firebase 프로젝트 생성 + Phone Auth 활성화
  - 또는 NHN Cloud SMS 가입 + 발신번호 등록
  - 프론트: 인증코드 요청/확인 로직 교체
  - 백엔드: 123456 하드코딩 → 실제 검증으로 교체
  - ENV: NHN_APP_KEY, NHN_SECRET_KEY (또는 Firebase 설정)

3단계: 인앱결제 (2-3일)
  - Apple/Google 개발자 계정 + 상품 등록
  - react-native-iap 설치 + 구매 로직 구현
  - 백엔드: 영수증 검증 API 구현
  - EAS Build 필수 (Expo Go에서 IAP 불가)
  - ENV: APPLE_SHARED_SECRET, GOOGLE_SERVICE_ACCOUNT_JSON

4단계: 테스트 + 앱스토어 심사 (3-5일)
  - Sandbox/테스트 환경에서 전체 플로우 검증
  - 앱스토어 심사 제출 (데이팅앱 = 2-4주 소요 가능)
```

## 주의사항

- **인앱결제는 EAS Build 필수**: Expo Go에서는 네이티브 모듈 불가
- **앱스토어 30% 수수료**: 10,000원 상품 → 실수령 7,000원
- **Google Play 15% 수수료** (연 매출 $1M 이하): 10,000원 → 8,500원
- **데이팅앱 심사 강화**: Apple은 본인확인, 안전 가이드, 신고 기능 필수 확인
- **카카오 로그인 심사**: 카카오싱크 사용 시 별도 비즈앱 심사 필요
