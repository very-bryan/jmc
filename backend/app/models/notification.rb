class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :actor, class_name: "User", optional: true

  enum :notification_type, {
    interest_received: 0,
    mutual_interest: 1,
    new_message: 2,
    profile_view: 3,
    system_notice: 4
  }

  scope :unread, -> { where(read: false) }
  scope :recent, -> { order(created_at: :desc) }

  def self.create_for(user:, type:, title:, body: nil, actor: nil, target: nil)
    create!(
      user: user,
      notification_type: type,
      title: title,
      body: body,
      actor_id: actor&.id,
      target_type: target&.class&.name,
      target_id: target&.id
    )
  end
end
