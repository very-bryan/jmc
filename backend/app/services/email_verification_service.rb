class EmailVerificationService
  # 개인 메일 도메인 차단 목록
  BLOCKED_DOMAINS = %w[
    gmail.com naver.com daum.net hanmail.net kakao.com
    nate.com hotmail.com outlook.com yahoo.com icloud.com
    protonmail.com mail.com yandex.com zoho.com
  ].freeze

  # 알려진 학교 도메인 패턴
  UNIVERSITY_PATTERNS = %w[.ac.kr .edu .edu.kr].freeze

  def self.valid_work_email?(email)
    return false if email.blank?

    domain = email.split("@").last&.downcase
    return false if domain.blank?
    return false if BLOCKED_DOMAINS.include?(domain)

    true
  end

  def self.email_type(email)
    return nil if email.blank?

    domain = email.split("@").last&.downcase
    return nil if domain.blank?

    if UNIVERSITY_PATTERNS.any? { |p| domain.end_with?(p) }
      "university"
    else
      "company"
    end
  end

  def self.generate_token
    SecureRandom.hex(3).upcase # 6자리 인증코드
  end

  def self.send_verification(user, email)
    return { error: "유효하지 않은 이메일입니다" } unless valid_work_email?(email)

    token = generate_token
    domain = email.split("@").last&.downcase

    user.update!(
      work_email: email,
      work_email_domain: domain,
      email_verification_token: token,
      work_email_verified: false
    )

    # TODO: 실제 이메일 발송 (ActionMailer 연동)
    # 지금은 토큰을 반환 (개발 모드)
    { token: token, email: email, type: email_type(email) }
  end

  def self.verify_token(user, token)
    return false if user.email_verification_token.blank?
    return false if user.email_verification_token != token.upcase.strip

    user.update!(
      work_email_verified: true,
      work_email_verified_at: Time.current,
      email_verification_token: nil
    )
    user.update_verification_level!
    true
  end
end
