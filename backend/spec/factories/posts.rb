FactoryBot.define do
  factory :post do
    user
    content { "테스트 게시글입니다" }
    mood_tag { "일상" }
    visibility { :public_post }
  end
end
