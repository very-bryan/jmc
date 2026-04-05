class AdminUser < ApplicationRecord
  has_secure_password

  has_many :admin_action_logs, dependent: :destroy
  has_many :announcements, dependent: :nullify
  has_many :sanctions, dependent: :nullify

  enum :role, { super_admin: 0, ops_admin: 1, cs_admin: 2, data_admin: 3 }

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :password, length: { minimum: 8, message: "비밀번호는 최소 8자 이상이어야 합니다" }, if: :password_digest_changed?

  scope :active_admins, -> { where(active: true) }

  def can_manage_users?
    super_admin? || ops_admin?
  end

  def can_manage_reports?
    super_admin? || ops_admin?
  end

  def can_manage_content?
    super_admin? || ops_admin?
  end

  def can_view_stats?
    super_admin? || data_admin?
  end

  def can_manage_settings?
    super_admin?
  end

  def read_only?
    cs_admin? || data_admin?
  end
end
