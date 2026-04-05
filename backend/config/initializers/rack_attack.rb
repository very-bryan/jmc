class Rack::Attack
  # 인증 API: IP당 분당 5회
  throttle("auth/ip", limit: 5, period: 1.minute) do |req|
    if req.path.start_with?("/api/v1/auth/") && req.post?
      req.ip
    end
  end

  # 일반 API: IP당 분당 60회
  throttle("api/ip", limit: 60, period: 1.minute) do |req|
    if req.path.start_with?("/api/")
      req.ip
    end
  end

  # 제한 초과 시 응답
  self.throttled_responder = lambda do |req|
    [429, { "Content-Type" => "application/json" }, [{ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }.to_json]]
  end
end
