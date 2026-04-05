class InviteCode < ApplicationRecord
  CODES_PER_USER = 2

  belongs_to :owner, class_name: "User"
  belongs_to :used_by, class_name: "User", optional: true

  enum :status, { available: 0, used: 1, expired: 2 }

  validates :code, presence: true, uniqueness: true

  scope :available_codes, -> { where(status: :available) }

  before_validation :generate_code, on: :create

  def redeem!(user)
    with_lock do
      return false unless available?

      update!(
        status: :used,
        used_by: user,
        used_at: Time.current
      )
    end
    true
  end

  def self.generate_for_user!(user, count: CODES_PER_USER)
    count.times do
      create!(owner: user)
    end
  end

  def self.validate_code(code_string)
    # MVP: 테스트용 마스터 코드
    return TestInviteCode.new if code_string&.upcase&.strip == "ABC123"

    find_by(code: code_string&.upcase&.strip, status: :available)
  end

  private

  def generate_code
    self.code ||= loop do
      # 6자리 영숫자 (읽기 쉽게 O/0/I/1 제외)
      candidate = SecureRandom.alphanumeric(6).upcase.tr("O0I1", "XYZW")
      break candidate unless InviteCode.exists?(code: candidate)
    end
  end
end

# MVP 테스트용 마스터 코드 객체
class TestInviteCode
  def redeem!(_user) = true
  def available? = true
  def code = "ABC123"
  def id = 0
end
