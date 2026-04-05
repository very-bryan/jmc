require "rails_helper"

RSpec.describe "Auth API", type: :request do
  describe "POST /api/v1/auth/request_code" do
    it "유효한 전화번호로 인증코드 요청" do
      post "/api/v1/auth/request_code", params: { phone: "01012345678" }
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["phone"]).to eq("01012345678")
    end

    it "잘못된 전화번호 거부" do
      post "/api/v1/auth/request_code", params: { phone: "123" }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/auth/verify_code" do
    it "올바른 코드(123456)로 인증 성공 - 기존 유저" do
      user = create(:user, phone: "01012345678")
      post "/api/v1/auth/verify_code", params: { phone: "01012345678", code: "123456" }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
      expect(body["is_new_user"]).to eq(false)
    end

    it "올바른 코드 - 신규 유저" do
      post "/api/v1/auth/verify_code", params: { phone: "01099999999", code: "123456" }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["is_new_user"]).to eq(true)
    end

    it "잘못된 코드 거부" do
      post "/api/v1/auth/verify_code", params: { phone: "01012345678", code: "000000" }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/auth/register" do
    it "초대코드로 가입 성공" do
      owner = create(:user)
      invite = create(:invite_code, owner: owner, code: "TESTCODE")

      post "/api/v1/auth/register", params: {
        invite_code: "TESTCODE",
        user: {
          phone: "0108888#{rand(1000..9999)}",
          password: "password123",
          nickname: "새유저#{rand(9999)}",
          gender: "male",
          birth_year: 1995,
          region: "서울"
        }
      }

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
    end

    it "초대코드/결제 없이 가입 거부" do
      post "/api/v1/auth/register", params: {
        user: {
          phone: "0109999#{rand(1000..9999)}",
          password: "password123",
          nickname: "거부유저#{rand(9999)}",
          gender: "male",
          birth_year: 1995,
          region: "서울"
        }
      }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "GET /api/v1/auth/me" do
    it "인증된 유저 정보 반환" do
      user = create(:user)
      get "/api/v1/auth/me", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["user"]["id"]).to eq(user.id)
    end

    it "토큰 없으면 401" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
