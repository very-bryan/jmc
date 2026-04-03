class PreferenceFilter < ApplicationRecord
  belongs_to :user

  enum :preferred_gender, { prefer_male: 0, prefer_female: 1, prefer_all: 2 }, prefix: true
  enum :preferred_smoking, { any_smoking: 0, prefer_non_smoker: 1, prefer_smoker: 2 }, prefix: true
  enum :preferred_drinking, { any_drinking: 0, prefer_non_drinker: 1, prefer_drinker: 2 }, prefix: true

  validates :preferred_gender, presence: true
  validates :min_age, numericality: { greater_than_or_equal_to: 19 }, allow_nil: true
  validates :max_age, numericality: { less_than_or_equal_to: 100 }, allow_nil: true

  serialize :preferred_regions, coder: JSON
end
