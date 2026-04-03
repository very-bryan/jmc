class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender, class_name: "User"

  enum :message_type, { text: 0, image: 1, system: 2 }

  validates :content, presence: true, length: { maximum: 2000 }
  validate :sender_is_participant

  after_create :update_conversation_timestamp
  after_create :safe_check_dm_milestones

  def read?
    metadata&.dig("read") == true
  end

  def mark_as_read!
    update!(metadata: (metadata || {}).merge("read" => true, "read_at" => Time.current.iso8601))
  end

  private

  def sender_is_participant
    unless conversation.match.includes_user?(sender)
      errors.add(:sender, "대화 참여자가 아닙니다")
    end
  end

  def update_conversation_timestamp
    conversation.update!(last_message_at: created_at)
  end

  def safe_check_dm_milestones
    check_dm_milestones
  rescue StandardError => e
    Rails.logger.warn("DM milestone check failed: #{e.message}")
  end

  def check_dm_milestones
    total = conversation.messages.count
    participants = conversation.participants
    counts = conversation.messages.group(:sender_id).count
    turns = counts.values.min || 0

    # 첫 메시지 (DM 시작)
    AnalyticsService.track_dm_milestone(conversation, "start") if total == 1

    # 5턴 달성 (핵심 아하모먼트 후보)
    AnalyticsService.track_dm_milestone(conversation, "5_turns") if turns == 5

    # 10턴 달성
    AnalyticsService.track_dm_milestone(conversation, "10_turns") if turns == 10

    # 2일 이상 대화
    if total > 1
      first_msg = conversation.messages.order(:created_at).first
      days = ((created_at - first_msg.created_at) / 86400).to_i
      if days >= 2 && ((created_at - 1.day - first_msg.created_at) / 86400).to_i < 2
        AnalyticsService.track_dm_milestone(conversation, "multi_day")
      end
    end
  end
end
