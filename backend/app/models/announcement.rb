class Announcement < ApplicationRecord
  belongs_to :admin_user

  enum :target_audience, { all_users: 0, male_only: 1, female_only: 2 }

  validates :title, presence: true
  validates :content, presence: true

  scope :active_now, -> {
    where(active: true)
      .where("starts_at IS NULL OR starts_at <= ?", Time.current)
      .where("ends_at IS NULL OR ends_at >= ?", Time.current)
  }
  scope :recent, -> { order(created_at: :desc) }
end
