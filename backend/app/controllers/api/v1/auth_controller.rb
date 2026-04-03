module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_request, only: [ :request_code, :verify_code, :register ]

      # POST /api/v1/auth/request_code
      def request_code
        phone = params[:phone]

        unless phone&.match?(/\A01[016789]\d{7,8}\z/)
          return render json: { error: "유효하지 않은 전화번호입니다" }, status: :unprocessable_entity
        end

        # MVP: 인증코드를 고정값으로 사용 (실 서비스에서는 SMS API 연동)
        code = Rails.env.production? ? rand(100000..999999).to_s : "123456"

        Rails.cache.write("phone_code:#{phone}", code, expires_in: 5.minutes)

        render json: { message: "인증코드가 발송되었습니다", phone: phone }
      end

      # POST /api/v1/auth/verify_code
      def verify_code
        phone = params[:phone]
        code = params[:code]

        cached_code = Rails.cache.read("phone_code:#{phone}")

        unless cached_code == code
          return render json: { error: "인증코드가 일치하지 않습니다" }, status: :unprocessable_entity
        end

        user = User.find_by(phone: phone)
        Rails.cache.delete("phone_code:#{phone}")

        if user
          user.update!(phone_verified: true)
          token = JwtService.encode(user_id: user.id)
          render json: { token: token, user: user_response(user), is_new_user: false }
        else
          render json: {
            message: "새로운 사용자입니다. 회원가입을 진행하세요.",
            phone: phone,
            phone_verified: true,
            is_new_user: true
          }
        end
      end

      # POST /api/v1/auth/register
      def register
        user = User.new(register_params)
        user.phone_verified = true
        user.status = :active
        user.verification_level = :phone_verified

        if user.save
          AnalyticsService.track_registration(user)
          token = JwtService.encode(user_id: user.id)
          render json: { token: token, user: user_response(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/auth/me
      def me
        render json: { user: user_response(current_user) }
      end

      private

      def register_params
        params.require(:user).permit(
          :phone, :password, :nickname, :gender, :birth_year,
          :region, :occupation, :desired_marriage_timing,
          :education, :height, :smoking, :drinking, :bio
        )
      end

      def user_response(user)
        {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          gender: user.gender,
          birth_year: user.birth_year,
          age: user.age,
          region: user.region,
          occupation: user.occupation,
          desired_marriage_timing: user.desired_marriage_timing,
          education: user.education,
          height: user.height,
          smoking: user.smoking,
          drinking: user.drinking,
          bio: user.bio,
          profile_image_url: user.profile_image_url,
          phone_verified: user.phone_verified,
          selfie_verified: user.selfie_verified,
          profile_completed: user.profile_completed,
          status: user.status,
          verification_level: user.verification_level,
          created_at: user.created_at
        }
      end
    end
  end
end
