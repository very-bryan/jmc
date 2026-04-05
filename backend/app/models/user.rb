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
  has_many :notifications, dependent: :destroy
  has_many :owned_invite_codes, class_name: "InviteCode", foreign_key: :owner_id, dependent: :destroy

  after_create :generate_invite_codes, if: :should_generate_codes?

  enum :gender, { male: 0, female: 1, other: 2 }
  enum :smoking, { non_smoker: 0, smoker: 1, occasional_smoker: 2 }, prefix: true
  enum :drinking, { non_drinker: 0, drinker: 1, occasional_drinker: 2 }, prefix: true
  enum :status, { pending_verification: 0, active: 1, in_relationship: 2, graduated: 3, suspended: 4, dormant: 5 }
  enum :verification_level, { basic: 0, phone_verified: 1, selfie_verified: 2, profile_verified: 3, fully_verified: 4 }, prefix: :level

  # 인증/보안 필드는 프로필 업데이트 API에서 변경 불가 (서버 내부에서만 변경)
  # profile_params에서 이 필드들을 permit하지 않아서 보호됨
  # 추가 방어: before_save 콜백으로 외부 변경 감지
  before_update :protect_verification_fields

  def protect_verification_fields
    if verification_level_changed? && !@allow_verification_update
      self.verification_level = verification_level_was
    end
  end

  def update_verification_level!
    @allow_verification_update = true
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
    @allow_verification_update = false
  end

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


  def available_invite_codes
    owned_invite_codes.available_codes
  end

  def invite_code_count
    owned_invite_codes.available_codes.count
  end

  private

  def should_generate_codes?
    profile_completed? || is_seed_user?
  end

  def generate_invite_codes
    InviteCode.generate_for_user!(self)
  end
end
