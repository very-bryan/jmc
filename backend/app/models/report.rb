class Report < ApplicationRecord
  belongs_to :reporter, class_name: "User"
  belongs_to :reported, class_name: "User"
  belongs_to :reportable, polymorphic: true

  enum :report_type, {
    fake_profile: 0,
    scam: 1,
    harassment: 2,
    inappropriate_photo: 3,
    external_solicitation: 4,
    married_suspect: 5,
    other: 6
  }

  enum :status, { submitted: 0, reviewing: 1, resolved: 2, dismissed: 3 }, prefix: :report

  validates :reason, presence: true, length: { maximum: 500 }
  validate :cannot_report_self

  after_create -> { AnalyticsService.track_report(self) }

  private

  def cannot_report_self
    errors.add(:reported, "자기 자신을 신고할 수 없습니다") if reporter_id == reported_id
  end
end
