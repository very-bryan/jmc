class PreRegistration < ApplicationRecord
  enum :gender, { male: 0, female: 1, other: 2 }

  validates :name, presence: true
  validates :phone, presence: true, uniqueness: true, format: { with: /\A01[016789]\d{7,8}\z/ }
  validates :birth_year, numericality: { greater_than: 1960, less_than_or_equal_to: ->(_) { Date.today.year - 19 } }, allow_nil: true
end
