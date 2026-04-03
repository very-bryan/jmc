require "net/http"
require "json"

class AnalyticsService
  UMAMI_URL = ENV.fetch("UMAMI_URL", "https://jmc-umami.verycloud.io")
  WEBSITE_ID = ENV.fetch("UMAMI_WEBSITE_ID", "")

  def self.track(event_name, data = {})
    return if WEBSITE_ID.blank?

    Thread.new do
      begin
        uri = URI("#{UMAMI_URL}/api/send")
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = uri.scheme == "https"
        http.open_timeout = 3
        http.read_timeout = 3

        request = Net::HTTP::Post.new(uri)
        request["Content-Type"] = "application/json"
        request.body = {
          type: "event",
          payload: {
            website: WEBSITE_ID,
            url: "/server",
            name: event_name,
            data: data.merge(source: "server"),
            language: "ko-KR"
          }
        }.to_json

        http.request(request)
      rescue StandardError
        # 트래킹 실패는 무시
      end
    end
  end

  # ── 온보딩 퍼널 ──
  def self.track_registration(user)
    track("registration_complete", {
      user_id: user.id,
      gender: user.gender,
      region: user.region,
      age: user.age
    })
  end

  # ── 상호 관심 성립 (핵심 아하모먼트 후보) ──
  def self.track_mutual_interest(sender, receiver)
    track("mutual_interest", {
      sender_id: sender.id,
      receiver_id: receiver.id,
      sender_gender: sender.gender,
      receiver_gender: receiver.gender,
      sender_days_since_signup: (Time.current - sender.created_at).to_i / 86400,
      receiver_days_since_signup: (Time.current - receiver.created_at).to_i / 86400
    })
  end

  # ── DM 마일스톤 (핵심 아하모먼트 후보) ──
  def self.track_dm_milestone(conversation, milestone)
    participants = conversation.participants
    track("dm_#{milestone}", {
      conversation_id: conversation.id,
      user_a_id: participants[0].id,
      user_b_id: participants[1].id,
      total_messages: conversation.messages.count,
      conversation_age_days: ((Time.current - conversation.created_at) / 86400).round(1)
    })
  end

  # ── 관심 보내기 ──
  def self.track_interest_sent(sender, receiver)
    track("interest_send", {
      sender_id: sender.id,
      receiver_id: receiver.id,
      sender_days_since_signup: (Time.current - sender.created_at).to_i / 86400
    })
  end

  # ── 관계 전환 ──
  def self.track_relationship(relationship, event_type)
    track("relationship_#{event_type}", {
      initiator_id: relationship.initiator_id,
      partner_id: relationship.partner_id,
      relationship_type: relationship.relationship_type
    })
  end

  # ── 안전 이벤트 ──
  def self.track_report(report)
    track("report_submit", {
      reporter_id: report.reporter_id,
      reported_id: report.reported_id,
      report_type: report.report_type
    })
  end

  def self.track_block(blocker, blocked)
    track("block_user", {
      blocker_id: blocker.id,
      blocked_id: blocked.id
    })
  end
end
