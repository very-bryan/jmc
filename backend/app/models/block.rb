class Block < ApplicationRecord
  belongs_to :blocker, class_name: "User"
  belongs_to :blocked, class_name: "User"

  validates :blocker_id, uniqueness: { scope: :blocked_id }
  validate :cannot_block_self

  after_create -> { AnalyticsService.track_block(blocker, blocked) }

  private

  def cannot_block_self
    errors.add(:blocked, "자기 자신을 차단할 수 없습니다") if blocker_id == blocked_id
  end
end
