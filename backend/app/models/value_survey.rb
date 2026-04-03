class ValueSurvey < ApplicationRecord
  belongs_to :user

  enum :marriage_intention, { very_willing: 0, willing: 1, open: 2, undecided: 3 }, prefix: true
  enum :children_plan, { want_children: 0, open_to_children: 1, no_children: 2, undecided_children: 3 }, prefix: true
  enum :lifestyle_pattern, { early_bird: 0, night_owl: 1, flexible: 2 }, prefix: true
  enum :spending_tendency, { frugal: 0, balanced: 1, generous: 2 }, prefix: true
  enum :relationship_style, { independent: 0, balanced_together: 1, very_close: 2 }, prefix: true
  enum :conflict_resolution, { discussion: 0, compromise: 1, space_first: 2, mediator: 3 }, prefix: true

  validates :marriage_intention, presence: true
  validates :children_plan, presence: true

  after_save :update_user_verification

  private

  def update_user_verification
    user.update_verification_level!
  end
end
