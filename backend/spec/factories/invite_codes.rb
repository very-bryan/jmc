FactoryBot.define do
  factory :invite_code do
    association :owner, factory: :user
    sequence(:code) { |n| "TEST#{n.to_s.rjust(4, '0')}" }
    status { :available }
  end
end
