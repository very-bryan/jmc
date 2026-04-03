class Conversation < ApplicationRecord
  belongs_to :match
  has_many :messages, dependent: :destroy

  enum :status, { active: 0, archived: 1, reported: 2 }

  scope :recent, -> { order(last_message_at: :desc) }

  def participants
    [ match.user1, match.user2 ]
  end

  def other_participant(user)
    match.other_user(user)
  end
end
