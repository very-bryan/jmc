class MbtiCompatibilityService
  # 궁합 레벨: 5=최고(파랑), 4=좋음(초록), 3=보통(연두), 2=주의(노랑), 1=안맞음(빨강)
  TYPES = %w[INFP ENFP INFJ ENFJ INTJ ENTJ INTP ENTP ISFP ESFP ISTP ESTP ISFJ ESFJ ISTJ ESTJ].freeze

  # 16x16 궁합 매트릭스 (이미지 기반)
  MATRIX = {
    #                INFP ENFP INFJ ENFJ INTJ ENTJ INTP ENTP ISFP ESFP ISTP ESTP ISFJ ESFJ ISTJ ESTJ
    "INFP" => [      4,   4,   4,   5,   4,   4,   4,   5,   1,   1,   1,   1,   1,   1,   1,   1  ],
    "ENFP" => [      4,   4,   4,   4,   5,   4,   4,   4,   1,   1,   1,   1,   1,   1,   1,   1  ],
    "INFJ" => [      4,   4,   4,   4,   4,   4,   4,   5,   3,   1,   1,   1,   1,   1,   1,   1  ],
    "ENFJ" => [      5,   4,   4,   4,   4,   4,   4,   4,   3,   3,   3,   3,   1,   1,   1,   1  ],
    "INTJ" => [      4,   5,   4,   4,   4,   4,   5,   4,   3,   3,   3,   3,   1,   1,   1,   1  ],
    "ENTJ" => [      4,   4,   4,   4,   4,   4,   5,   4,   3,   3,   3,   3,   3,   2,   2,   2  ],
    "INTP" => [      4,   4,   4,   4,   5,   5,   4,   4,   3,   3,   3,   3,   2,   2,   2,   2  ],
    "ENTP" => [      5,   4,   5,   4,   4,   4,   4,   4,   3,   3,   3,   3,   2,   2,   5,   2  ],
    "ISFP" => [      1,   1,   3,   3,   3,   3,   3,   3,   2,   2,   2,   2,   5,   3,   5,   3  ],
    "ESFP" => [      1,   1,   1,   3,   3,   3,   3,   3,   2,   2,   2,   2,   3,   5,   3,   5  ],
    "ISTP" => [      1,   1,   1,   3,   3,   3,   3,   3,   2,   2,   2,   2,   3,   5,   3,   3  ],
    "ESTP" => [      1,   1,   1,   3,   3,   3,   3,   3,   2,   2,   2,   2,   5,   3,   3,   3  ],
    "ISFJ" => [      1,   1,   1,   1,   1,   3,   2,   2,   5,   3,   3,   5,   4,   4,   4,   4  ],
    "ESFJ" => [      1,   1,   1,   1,   1,   2,   2,   2,   3,   5,   5,   3,   4,   4,   4,   4  ],
    "ISTJ" => [      1,   1,   1,   1,   1,   2,   2,   5,   5,   3,   3,   3,   4,   4,   4,   4  ],
    "ESTJ" => [      1,   1,   1,   1,   1,   2,   2,   2,   3,   5,   3,   3,   4,   4,   4,   4  ],
  }.freeze

  LABELS = {
    5 => { label: "최고", color: "blue" },
    4 => { label: "좋음", color: "green" },
    3 => { label: "보통", color: "light_green" },
    2 => { label: "주의", color: "yellow" },
    1 => { label: "안맞음", color: "red" },
  }.freeze

  def self.score(mbti1, mbti2)
    return nil if mbti1.blank? || mbti2.blank?

    m1 = mbti1.upcase.strip
    m2 = mbti2.upcase.strip

    return nil unless TYPES.include?(m1) && TYPES.include?(m2)

    idx = TYPES.index(m2)
    MATRIX[m1][idx]
  end

  def self.compatibility(mbti1, mbti2)
    s = score(mbti1, mbti2)
    return nil unless s

    {
      score: s,
      label: LABELS[s][:label],
      color: LABELS[s][:color]
    }
  end
end
