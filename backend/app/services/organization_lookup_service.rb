require "net/http"
require "json"

class OrganizationLookupService
  GEMINI_API_KEY = ENV.fetch("GEMINI_API_KEY", "")
  GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

  def self.lookup(domain:, user_provided_name: nil)
    # 1. 자체 DB 확인
    org_domain = OrganizationDomain.lookup(domain)

    if org_domain&.verified?
      return {
        status: :verified,
        organization_name: org_domain.organization_name,
        organization_type: org_domain.organization_type,
        source: "db"
      }
    end

    # 2. 자동 승인 가능한지 확인 (3명 이상 인증)
    if org_domain&.auto_approvable?
      return {
        status: :auto_approved,
        organization_name: org_domain.organization_name,
        organization_type: org_domain.organization_type,
        source: "auto"
      }
    end

    # 3. 도메인 패턴으로 학교 식별
    if university_domain?(domain)
      result = ai_lookup(domain, user_provided_name) if GEMINI_API_KEY.present?
      name = result&.dig(:name) || user_provided_name || domain

      org = OrganizationDomain.find_or_create_for(domain)
      org.update!(
        organization_name: name,
        organization_type: :university,
        verified: true,
        verified_by: :auto_verified
      )

      return { status: :verified, organization_name: name, organization_type: "university", source: "pattern" }
    end

    # 4. AI 검색
    if GEMINI_API_KEY.present?
      result = ai_lookup(domain, user_provided_name)

      if result && result[:confidence] > 0.7
        org = OrganizationDomain.find_or_create_for(domain)
        org.update!(
          organization_name: result[:name],
          organization_type: result[:type],
          ai_confidence: result[:confidence],
          ai_raw_response: result[:raw],
          verified: result[:confidence] > 0.9,
          verified_by: result[:confidence] > 0.9 ? :ai_verified : :unverified
        )

        return {
          status: result[:confidence] > 0.9 ? :ai_verified : :pending_review,
          organization_name: result[:name],
          organization_type: result[:type],
          confidence: result[:confidence],
          source: "ai"
        }
      end
    end

    # 5. 유저 입력 회사명 사용 (검수 대기)
    if user_provided_name.present?
      org = OrganizationDomain.find_or_create_for(domain)
      org.update!(
        organization_name: user_provided_name,
        organization_type: detect_type(domain)
      ) if org.organization_name.blank?

      return {
        status: :pending_review,
        organization_name: user_provided_name,
        organization_type: org.organization_type,
        source: "user_input"
      }
    end

    # 6. 아무것도 모름
    { status: :unknown, organization_name: nil, source: "none" }
  end

  private

  def self.university_domain?(domain)
    domain.end_with?(".ac.kr", ".edu", ".edu.kr")
  end

  def self.detect_type(domain)
    return :university if university_domain?(domain)
    return :government if domain.end_with?(".go.kr", ".gov")
    :company
  end

  def self.ai_lookup(domain, user_hint = nil)
    prompt = build_prompt(domain, user_hint)

    uri = URI("#{GEMINI_URL}?key=#{GEMINI_API_KEY}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 10
    http.read_timeout = 10

    request = Net::HTTP::Post.new(uri)
    request["Content-Type"] = "application/json"
    request.body = {
      contents: [ { parts: [ { text: prompt } ] } ],
      generationConfig: { temperature: 0.1 }
    }.to_json

    response = http.request(request)
    return nil unless response.code == "200"

    body = JSON.parse(response.body)
    text = body.dig("candidates", 0, "content", "parts", 0, "text")
    return nil if text.blank?

    parse_ai_response(text)
  rescue StandardError => e
    Rails.logger.warn("AI lookup failed for #{domain}: #{e.message}")
    nil
  end

  def self.build_prompt(domain, user_hint)
    hint_part = user_hint.present? ? "사용자가 '#{user_hint}'라고 입력했습니다. " : ""

    <<~PROMPT
      이메일 도메인 "#{domain}"이 어떤 조직인지 알려주세요.
      #{hint_part}
      다음 JSON 형식으로만 답해주세요. 다른 텍스트 없이 JSON만:
      {
        "name": "조직의 정식 한국어 이름 (없으면 영어)",
        "type": "company 또는 university 또는 government 또는 other",
        "confidence": 0.0~1.0 사이의 확신도,
        "description": "한줄 설명"
      }
      모르겠으면 confidence를 0.3 이하로 설정해주세요.
    PROMPT
  end

  def self.parse_ai_response(text)
    json_match = text.match(/\{[^}]+\}/m)
    return nil unless json_match

    data = JSON.parse(json_match[0])

    {
      name: data["name"],
      type: data["type"]&.to_sym || :company,
      confidence: data["confidence"]&.to_f || 0.5,
      description: data["description"],
      raw: text
    }
  rescue JSON::ParserError
    nil
  end
end
