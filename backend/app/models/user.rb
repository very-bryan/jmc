class User < ApplicationRecord
  has_secure_password

  has_one :value_survey, dependent: :destroy
  has_one :preference_filter, dependent: :destroy
  has_many :posts, dependent: :destroy

  has_many :sent_interests, class_name: "Interest", foreign_key: :sender_id, dependent: :destroy
  has_many :received_interests, class_name: "Interest", foreign_key: :receiver_id, dependent: :destroy

  has_many :matches_as_user1, class_name: "Match", foreign_key: :user1_id, dependent: :destroy
  has_many :matches_as_user2, class_name: "Match", foreign_key: :user2_id, dependent: :destroy

  has_many :sent_messages, class_name: "Message", foreign_key: :sender_id, dependent: :destroy

  has_many :reports_filed, class_name: "Report", foreign_key: :reporter_id, dependent: :destroy
  has_many :reports_received, class_name: "Report", foreign_key: :reported_id, dependent: :destroy

  has_many :blocks_given, class_name: "Block", foreign_key: :blocker_id, dependent: :destroy
  has_many :blocks_received, class_name: "Block", foreign_key: :blocked_id, dependent: :destroy
  has_many :blocked_users, through: :blocks_given, source: :blocked

  has_many :initiated_relationships, class_name: "Relationship", foreign_key: :initiator_id, dependent: :destroy
  has_many :received_relationships, class_name: "Relationship", foreign_key: :partner_id, dependent: :destroy

  has_many :sanctions, dependent: :destroy

  enum :gender, { male: 0, female: 1, other: 2 }
  enum :smoking, { non_smoker: 0, smoker: 1, occasional_smoker: 2 }, prefix: true
  enum :drinking, { non_drinker: 0, drinker: 1, occasional_drinker: 2 }, prefix: true
  enum :status, { pending_verification: 0, active: 1, in_relationship: 2, graduated: 3, suspended: 4, dormant: 5 }
  enum :verification_level, { basic: 0, phone_verified: 1, selfie_verified: 2, profile_verified: 3, fully_verified: 4 }, prefix: :level

  validates :phone, presence: true, uniqueness: true, format: { with: /\A01[016789]\d{7,8}\z/ }
  validates :nickname, uniqueness: true, length: { minimum: 2, maximum: 20 }, allow_nil: true
  validates :birth_year, numericality: { greater_than: 1960, less_than_or_equal_to: ->(_) { Date.today.year - 19 } }, allow_nil: true
  validates :height, numericality: { greater_than: 100, less_than: 250 }, allow_nil: true

  scope :visible, -> { where(status: :active) }
  scope :verified, -> { where(phone_verified: true, selfie_verified: true) }

  def matches
    Match.where("user1_id = ? OR user2_id = ?", id, id)
  end

  def age
    return nil unless birth_year
    Date.today.year - birth_year
  end

  def blocked?(user)
    blocks_given.exists?(blocked: user)
  end

  def mutual_interest_with?(user)
    sent_interests.exists?(receiver: user, status: :accepted) ||
      received_interests.exists?(sender: user, status: :accepted)
  end

  def update_verification_level!
    level = if value_survey.present? && profile_completed?
              :profile_verified
            elsif selfie_verified?
              :selfie_verified
            elsif phone_verified?
              :phone_verified
            else
              :basic
            end
    update!(verification_level: level)
  end
end
