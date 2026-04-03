module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_request, only: [ :request_code, :verify_code, :register, :kakao_login ]

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
        invite_code_str = params[:invite_code]
        payment_token = params[:payment_token]
        is_seed = params[:is_seed] == true

        # 시드 유저가 아니면 초대코드 or 결제 필요
        unless is_seed
          if invite_code_str.present?
            invite_code = InviteCode.validate_code(invite_code_str)
            unless invite_code
              return render json: { error: "유효하지 않은 초대코드입니다" }, status: :unprocessable_entity
            end
          elsif payment_token.present?
            # TODO: 토스페이먼츠 결제 검증 연동
            # 지금은 payment_token이 있으면 결제 완료로 처리
          else
            return render json: { error: "초대코드 또는 결제가 필요합니다" }, status: :unprocessable_entity
          end
        end

        user = User.new(register_params)
        user.phone_verified = true
        user.status = :active
        user.verification_level = :phone_verified
        user.invited_by_code = invite_code_str if invite_code_str.present?
        user.paid = payment_token.present?
        user.is_seed_user = is_seed

        # 카카오 정보 매핑
        if params[:kakao_id].present?
          user.kakao_id = params[:kakao_id]
          user.kakao_nickname = params[:kakao_nickname]
          user.kakao_profile_image = params[:kakao_profile_image]
          user.kakao_email = params[:kakao_email]
        end

        if user.save
          # 초대코드 사용 처리
          invite_code&.redeem!(user)

          AnalyticsService.track_registration(user)
          AnalyticsService.track("registration_method", {
            method: is_seed ? "seed" : invite_code_str.present? ? "invite" : "paid",
            user_id: user.id
          })

          token = JwtService.encode(user_id: user.id)
          render json: { token: token, user: user_response(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/auth/kakao
      def kakao_login
        kakao_token = params[:kakao_access_token]
        return render json: { error: "카카오 토큰이 필요합니다" }, status: :unprocessable_entity unless kakao_token

        kakao_info = KakaoAuthService.get_user_info(kakao_token)
        return render json: { error: "카카오 인증에 실패했습니다" }, status: :unprocessable_entity unless kakao_info

        user = User.find_by(kakao_id: kakao_info[:kakao_id])

        if user
          # 기존 유저 로그인
          token = JwtService.encode(user_id: user.id)
          AnalyticsService.track("login_kakao", { user_id: user.id })
          render json: { token: token, user: user_response(user), is_new_user: false }
        else
          # 새 유저 → 추가 정보 필요
          render json: {
            is_new_user: true,
            kakao_info: {
              kakao_id: kakao_info[:kakao_id],
              nickname: kakao_info[:nickname],
              profile_image: kakao_info[:profile_image],
              email: kakao_info[:email],
              gender: kakao_info[:gender],
            }
          }
        end
      end

      # POST /api/v1/auth/verify_work_email
      def send_work_email_verification
        email = params[:email]
        result = EmailVerificationService.send_verification(current_user, email)

        if result[:error]
          render json: { error: result[:error] }, status: :unprocessable_entity
        else
          render json: { message: "인증 메일이 발송되었습니다", email_type: result[:type] }
        end
      end

      # POST /api/v1/auth/confirm_work_email
      def confirm_work_email
        token = params[:token]

        if EmailVerificationService.verify_token(current_user, token)
          render json: { message: "메일 인증이 완료되었습니다", user: user_response(current_user) }
        else
          render json: { error: "인증코드가 일치하지 않습니다" }, status: :unprocessable_entity
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
          invite_code_count: user.invite_code_count,
          is_seed_user: user.is_seed_user,
          paid: user.paid,
          kakao_connected: user.kakao_id.present?,
          work_email_verified: user.work_email_verified,
          work_email_domain: user.work_email_domain,
          created_at: user.created_at
        }
      end
    end
  end
end
