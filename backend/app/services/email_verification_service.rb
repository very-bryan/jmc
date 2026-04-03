class EmailVerificationService
  # 개인 메일 + 주요 무료 메일 차단
  BLOCKED_DOMAINS = %w[
    gmail.com googlemail.com naver.com daum.net hanmail.net kakao.com
    nate.com hotmail.com outlook.com outlook.kr live.com yahoo.com yahoo.co.kr
    icloud.com me.com mac.com protonmail.com proton.me mail.com yandex.com
    zoho.com aol.com gmx.com gmx.de tutanota.com fastmail.com
    qq.com 163.com 126.com sina.com
    mailinator.com guerrillamail.com tempmail.com throwaway.email
    yopmail.com sharklasers.com guerrillamailblock.com grr.la
    dispostable.com trashmail.com maildrop.cc temp-mail.org
    fakeinbox.com emailondeck.com getnada.com burnermail.io
  ].freeze

  def self.valid_work_email?(email)
    return false if email.blank?

    domain = email.split("@").last&.downcase
    return false if domain.blank?
    return false if BLOCKED_DOMAINS.include?(domain)
    return false unless email.match?(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/)

    true
  end

  def self.generate_token
    SecureRandom.hex(3).upcase
  end

  def self.send_verification(user, email, organization_name: nil)
    return { error: "개인 메일은 사용할 수 없습니다. 직장 또는 학교 메일을 입력해주세요." } unless valid_work_email?(email)

    domain = email.split("@").last&.downcase
    token = generate_token

    # 조직 조회 (DB → AI)
    org_result = OrganizationLookupService.lookup(
      domain: domain,
      user_provided_name: organization_name
    )

    user.update!(
      work_email: email,
      work_email_domain: domain,
      email_verification_token: token,
      work_email_verified: false,
      organization_name: org_result[:organization_name] || organization_name
    )

    # OrganizationDomain 카운트 증가
    org_domain = OrganizationDomain.find_or_create_for(domain)
    org_domain.increment_user_count!

    # TODO: ActionMailer로 실제 인증 메일 발송
    # VerificationMailer.send_code(email, token).deliver_later

    {
      token: token, # 개발 모드에서만 반환
      email: email,
      organization_name: org_result[:organization_name] || organization_name,
      organization_type: org_result[:organization_type],
      verification_status: org_result[:status],
      auto_approved: org_result[:status] == :verified || org_result[:status] == :auto_approved
    }
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

    AnalyticsService.track("work_email_verified", {
      user_id: user.id,
      domain: user.work_email_domain,
      organization: user.organization_name
    })

    true
  end
end
