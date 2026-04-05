FactoryBot.define do
  factory :user do
    sequence(:phone) { |n| "0101234#{n.to_s.rjust(4, '0')}" }
    password { "password123" }
    nickname { "테스트유저#{rand(1000)}" }
    gender { :male }
    birth_year { 1995 }
    region { "서울" }
    occupation { "개발자" }
    status { :active }
    phone_verified { true }
    verification_level { :phone_verified }

    trait :female do
      gender { :female }
    end

    trait :graduated do
      status { :graduated }
    end

    trait :suspended do
      status { :suspended }
    end
  end
end
