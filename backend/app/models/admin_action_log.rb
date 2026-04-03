class AdminActionLog < ApplicationRecord
  belongs_to :admin_user

  validates :action, presence: true

  scope :recent, -> { order(created_at: :desc) }

  def self.log!(admin_user:, action:, target: nil, details: {}, ip_address: nil)
    create!(
      admin_user: admin_user,
      action: action,
      target_type: target&.class&.name,
      target_id: target&.id,
      details: details,
      ip_address: ip_address
    )
  end
end
