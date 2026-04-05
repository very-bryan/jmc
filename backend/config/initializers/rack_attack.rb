# 테스트 환경에서는 rate limit 비활성화
if Rails.env.test?
  Rack::Attack.enabled = false
else
  # 캐시 스토어 설정 (Redis 없으면 메모리 사용)
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
end

class Rack::Attack
  # 인증 API: IP당 분당 5회
  throttle("auth/ip", limit: 5, period: 1.minute) do |req|
    if req.path.start_with?("/api/v1/auth/") && req.post?
      req.ip
    end
  end

  # 사용자별: JWT 토큰당 분당 30회 (관심/차단/신고)
  throttle("user_actions/jwt", limit: 30, period: 1.minute) do |req|
    if req.path.match?(%r{/api/v1/(interests|blocks|reports)}) && req.post?
      # Authorization 헤더에서 토큰 추출
      req.env["HTTP_AUTHORIZATION"]&.split(" ")&.last
    end
  end

  # 일반 API: IP당 분당 60회
  throttle("api/ip", limit: 60, period: 1.minute) do |req|
    if req.path.start_with?("/api/")
      req.ip
    end
  end

  # 사전등록: IP당 시간당 5회
  throttle("pre_registration/ip", limit: 5, period: 1.hour) do |req|
    if req.path == "/api/v1/pre_registrations" && req.post?
      req.ip
    end
  end

  # 관리자 로그인: IP당 분당 3회
  throttle("admin/login", limit: 3, period: 1.minute) do |req|
    if req.path == "/admin/login" && req.post?
      req.ip
    end
  end

  # 제한 초과 시 응답
  self.throttled_responder = lambda do |req|
    [429, { "Content-Type" => "application/json" }, [{ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }.to_json]]
  end
end
