class OrganizationDomain < ApplicationRecord
  AUTO_APPROVE_THRESHOLD = 3

  enum :organization_type, { company: 0, university: 1, government: 2, other: 3 }
  enum :verified_by, { unverified: 0, admin_verified: 1, auto_verified: 2, ai_verified: 3 }, prefix: :by

  validates :domain, presence: true, uniqueness: true

  scope :verified_domains, -> { where(verified: true) }

  def self.lookup(domain)
    find_by(domain: domain.downcase)
  end

  def self.find_or_create_for(domain)
    find_or_create_by(domain: domain.downcase)
  end

  def auto_approvable?
    verified? || user_count >= AUTO_APPROVE_THRESHOLD
  end

  def increment_user_count!
    increment!(:user_count)

    if !verified? && user_count >= AUTO_APPROVE_THRESHOLD
      update!(verified: true, verified_by: :auto_verified)
    end
  end
end
