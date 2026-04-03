require "net/http"
require "json"

class KakaoAuthService
  KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me"

  def self.get_user_info(access_token)
    uri = URI(KAKAO_USER_INFO_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Get.new(uri)
    request["Authorization"] = "Bearer #{access_token}"

    response = http.request(request)
    return nil unless response.code == "200"

    data = JSON.parse(response.body)

    {
      kakao_id: data["id"].to_s,
      nickname: data.dig("kakao_account", "profile", "nickname"),
      profile_image: data.dig("kakao_account", "profile", "profile_image_url"),
      email: data.dig("kakao_account", "email"),
      gender: parse_gender(data.dig("kakao_account", "gender")),
      age_range: data.dig("kakao_account", "age_range"),
      birthday: data.dig("kakao_account", "birthday"),
    }
  rescue StandardError
    nil
  end

  def self.parse_gender(gender_str)
    case gender_str
    when "male" then :male
    when "female" then :female
    else nil
    end
  end
end
