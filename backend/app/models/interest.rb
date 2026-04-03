class Interest < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :receiver, class_name: "User"

  enum :status, { pending: 0, accepted: 1, declined: 2 }

  scope :recent_first, -> { order(created_at: :desc) }

  validates :sender_id, uniqueness: { scope: :receiver_id, message: "이미 관심을 보냈습니다" }
  validate :cannot_interest_self
  validate :cannot_interest_blocked_user
  validate :daily_interest_limit, on: :create

  after_create :check_mutual_interest

  private

  def cannot_interest_self
    errors.add(:receiver, "자기 자신에게 관심을 보낼 수 없습니다") if sender_id == receiver_id
  end

  def cannot_interest_blocked_user
    if sender.blocked?(receiver) || receiver.blocked?(sender)
      errors.add(:base, "차단된 사용자입니다")
    end
  end

  def daily_interest_limit
    daily_count = sender.sent_interests.where("created_at >= ?", Time.current.beginning_of_day).count
    errors.add(:base, "하루 관심 보내기 횟수를 초과했습니다") if daily_count >= 10
  end

  def check_mutual_interest
    reverse = Interest.find_by(sender: receiver, receiver: sender, status: :pending)
    if reverse
      reverse.update!(status: :accepted)
      update!(status: :accepted)
      create_match!
    end
  end

  def create_match!
    user_ids = [ sender_id, receiver_id ].sort
    match = Match.create!(
      user1_id: user_ids.first,
      user2_id: user_ids.last,
      status: :active,
      matched_at: Time.current
    )
    Conversation.create!(match: match, status: :active, last_message_at: Time.current)
  end
end
