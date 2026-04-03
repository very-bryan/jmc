class Match < ApplicationRecord
  belongs_to :user1, class_name: "User"
  belongs_to :user2, class_name: "User"
  has_one :conversation, dependent: :destroy

  enum :status, { active: 0, inactive: 1, ended: 2 }

  validates :user1_id, uniqueness: { scope: :user2_id }

  def other_user(user)
    user.id == user1_id ? user2 : user1
  end

  def includes_user?(user)
    user1_id == user.id || user2_id == user.id
  end
end
