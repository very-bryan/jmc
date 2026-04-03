class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender, class_name: "User"

  enum :message_type, { text: 0, image: 1, system: 2 }

  validates :content, presence: true, length: { maximum: 2000 }
  validate :sender_is_participant

  after_create :update_conversation_timestamp

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
end
