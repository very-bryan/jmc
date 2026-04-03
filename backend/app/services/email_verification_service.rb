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

  # verify_type: "company" or "university"
  def self.send_verification(user, email, organization_name: nil, verify_type: "company")
    return { error: "개인 메일은 사용할 수 없습니다. 직장 또는 학교 메일을 입력해주세요." } unless valid_work_email?(email)

    domain = email.split("@").last&.downcase
    token = generate_token

    # 자동 타입 감지: .ac.kr / .edu → university
    detected_type = domain.match?(/\.(ac\.kr|edu|edu\.kr)$/) ? "university" : verify_type

    # 조직 조회 (DB → AI)
    org_result = OrganizationLookupService.lookup(
      domain: domain,
      user_provided_name: organization_name
    )

    resolved_name = org_result[:organization_name] || organization_name

    # 타입에 따라 다른 필드에 저장
    attrs = { email_verification_token: token, email_verify_type: detected_type }

    if detected_type == "university"
      attrs.merge!(university_email: email, university_domain: domain, university_name: resolved_name, university_verified: false)
    else
      attrs.merge!(company_email: email, company_domain: domain, company_name: resolved_name, company_verified: false)
    end

    user.update!(attrs)

    # OrganizationDomain 카운트 증가
    org_domain = OrganizationDomain.find_or_create_for(domain)
    org_domain.increment_user_count!

    # TODO: ActionMailer로 실제 인증 메일 발송

    {
      token: token,
      email: email,
      organization_name: resolved_name,
      organization_type: detected_type,
    }
  end

  def self.verify_token(user, token)
    return false if user.email_verification_token.blank?
    return false if user.email_verification_token != token.upcase.strip

    verify_type = user.email_verify_type || "company"

    if verify_type == "university"
      user.update!(
        university_verified: true,
        university_verified_at: Time.current,
        email_verification_token: nil,
        email_verify_type: nil
      )
    else
      user.update!(
        company_verified: true,
        company_verified_at: Time.current,
        email_verification_token: nil,
        email_verify_type: nil
      )
    end

    user.update_verification_level!

    AnalyticsService.track("email_verified", {
      user_id: user.id,
      type: verify_type,
      domain: verify_type == "university" ? user.university_domain : user.company_domain,
      organization: verify_type == "university" ? user.university_name : user.company_name
    })

    true
  end
end
