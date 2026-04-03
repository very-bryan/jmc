class Relationship < ApplicationRecord
  belongs_to :initiator, class_name: "User"
  belongs_to :partner, class_name: "User"

  enum :relationship_type, { dating: 0, graduated: 1 }
  enum :status, { requested: 0, confirmed: 1, ended: 2 }, prefix: :rel

  validate :cannot_relate_self

  after_create -> { AnalyticsService.track_relationship(self, "request") }
  after_save :update_user_statuses, if: :rel_confirmed?
  after_save -> { AnalyticsService.track_relationship(self, graduated? ? "graduation_confirm" : "confirm") }, if: :rel_confirmed?

  private

  def cannot_relate_self
    errors.add(:partner, "자기 자신과 관계를 맺을 수 없습니다") if initiator_id == partner_id
  end

  def update_user_statuses
    new_status = graduated? ? :graduated : :in_relationship
    initiator.update!(status: new_status)
    partner.update!(status: new_status)
  end
end
