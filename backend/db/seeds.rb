puts "Seeding development data..."

# Clear existing data
[ AdminActionLog, Sanction, Announcement, AdminUser, Message, Conversation, Match, Interest, Block, Report, Relationship, Post, PostImage, ValueSurvey, PreferenceFilter, User ].each(&:delete_all)

# Admin Users
admin_pw = ENV.fetch("ADMIN_PASSWORD", "admin123")
AdminUser.create!(email: "admin@jmc.com", password: admin_pw, name: "슈퍼관리자", role: :super_admin)
AdminUser.create!(email: "ops@jmc.com", password: admin_pw, name: "운영관리자", role: :ops_admin)
AdminUser.create!(email: "cs@jmc.com", password: admin_pw, name: "CS관리자", role: :cs_admin)
AdminUser.create!(email: "data@jmc.com", password: admin_pw, name: "데이터관리자", role: :data_admin)
puts "Created admin users"

users_data = [
  { phone: "01011111111", nickname: "지은", gender: :female, birth_year: 1995, region: "서울", occupation: "디자이너", bio: "카페에서 그림 그리는 걸 좋아해요" },
  { phone: "01022222222", nickname: "민수", gender: :male, birth_year: 1993, region: "서울", occupation: "개발자", bio: "주말엔 등산하는 걸 좋아합니다" },
  { phone: "01033333333", nickname: "수현", gender: :female, birth_year: 1996, region: "경기", occupation: "마케터", bio: "맛집 탐방이 취미입니다" },
  { phone: "01044444444", nickname: "준호", gender: :male, birth_year: 1992, region: "서울", occupation: "금융", bio: "진지한 만남을 원합니다" },
  { phone: "01055555555", nickname: "하은", gender: :female, birth_year: 1994, region: "인천", occupation: "교사", bio: "책 읽는 거 좋아하는 교사입니다" },
  { phone: "01066666666", nickname: "성민", gender: :male, birth_year: 1991, region: "부산", occupation: "의사", bio: "부산에서 일하고 있어요" },
  { phone: "01077777777", nickname: "예진", gender: :female, birth_year: 1997, region: "서울", occupation: "간호사", bio: "운동 좋아하는 간호사입니다" },
  { phone: "01088888888", nickname: "태현", gender: :male, birth_year: 1994, region: "대전", occupation: "연구원", bio: "커피와 와인을 좋아합니다" },
]

users = users_data.map do |data|
  User.create!(
    **data,
    password: "password123",
    desired_marriage_timing: [ "within_1_year", "within_3_years", "within_5_years" ].sample,
    phone_verified: true,
    selfie_verified: true,
    profile_completed: true,
    status: :active,
    verification_level: :profile_verified,
    height: rand(155..185),
    smoking: [ :non_smoker, :occasional_smoker ].sample,
    drinking: [ :non_drinker, :occasional_drinker ].sample
  )
end

puts "Created #{users.size} users"

# Value Surveys
users.each do |user|
  ValueSurvey.create!(
    user: user,
    marriage_intention: [ :very_willing, :willing, :open ].sample,
    children_plan: [ :want_children, :open_to_children ].sample,
    religion: [ "무교", "기독교", "불교", "천주교", nil ].sample,
    lifestyle_pattern: [ :early_bird, :night_owl, :flexible ].sample,
    spending_tendency: [ :frugal, :balanced, :generous ].sample,
    relationship_style: [ :independent, :balanced_together, :very_close ].sample,
    conflict_resolution: [ :discussion, :compromise, :space_first ].sample
  )
end

puts "Created value surveys"

# Preference Filters
users.each do |user|
  preferred = user.female? ? :prefer_male : :prefer_female
  PreferenceFilter.create!(
    user: user,
    preferred_gender: preferred,
    min_age: 25,
    max_age: 40,
    preferred_regions: [ "서울", "경기" ]
  )
end

puts "Created preference filters"

# Posts
mood_tags = [ "일상", "취미", "맛집", "여행", "운동", "독서", "음악", "요리" ]
post_contents = [
  "오늘 날씨가 좋아서 한강 산책했어요",
  "주말에 새로운 카페를 발견했습니다",
  "독서 모임 다녀왔어요. 좋은 사람들!",
  "요즘 요리에 빠져있어요. 오늘은 파스타!",
  "퇴근 후 러닝 완료. 기분 최고!",
  "주말 등산 인증. 정상에서 찍은 사진입니다",
  "새로 산 책 추천해요. 정말 좋았습니다",
  "반려견과 산책하는 시간이 제일 좋아요",
  "출근 전 모닝 커피 한 잔의 여유",
  "친구들과 보드게임 카페 다녀왔어요",
]

users.each do |user|
  rand(2..4).times do
    Post.create!(
      user: user,
      content: post_contents.sample,
      mood_tag: mood_tags.sample,
      status: :published,
      visibility: :public_post
    )
  end
end

puts "Created posts"

# Some mutual interests (creates matches and conversations)
interest_pairs = [ [ 0, 1 ], [ 2, 3 ], [ 4, 5 ] ]
interest_pairs.each do |i, j|
  Interest.create!(sender: users[i], receiver: users[j])
  Interest.create!(sender: users[j], receiver: users[i])
end

puts "Created mutual interests and matches"

# Some messages
Conversation.all.each do |conv|
  participants = conv.participants
  messages = [
    "안녕하세요! 프로필 보고 관심 보냈어요",
    "안녕하세요! 반갑습니다 :)",
    "혹시 어떤 일 하세요?",
    "저는 #{participants[0].occupation} 하고 있어요",
    "취미가 비슷한 것 같아 좋네요",
  ]

  messages.each_with_index do |content, idx|
    Message.create!(
      conversation: conv,
      sender: participants[idx % 2],
      content: content,
      metadata: { read: true }
    )
  end
end

puts "Created messages"
puts "Seed complete!"
