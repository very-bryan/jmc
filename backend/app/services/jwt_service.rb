class JwtService
  SECRET_KEY = Rails.application.credentials.secret_key_base || ENV.fetch("SECRET_KEY_BASE") { raise "SECRET_KEY_BASE가 설정되지 않았습니다" }

  def self.encode(payload, exp = 7.days.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end
end
