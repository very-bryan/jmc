class Sanction < ApplicationRecord
  belongs_to :admin_user
  belongs_to :user

  enum :sanction_type, {
    warning: 0,
    feature_restriction: 1,
    reauth_required: 2,
    temporary_suspension: 3,
    permanent_suspension: 4,
    forced_dormant: 5
  }

  validates :reason, presence: true

  scope :active_sanctions, -> { where(active: true) }
  scope :recent, -> { order(created_at: :desc) }

  after_create :apply_sanction

  private

  def apply_sanction
    case sanction_type
    when "temporary_suspension", "permanent_suspension"
      user.update!(status: :suspended)
    when "forced_dormant"
      user.update!(status: :dormant)
    end
  end
end
