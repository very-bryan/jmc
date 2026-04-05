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

        # MVP: 테스트용 고정 인증코드 (실 서비스에서는 SMS API 연동)
        render json: { message: "인증코드가 발송되었습니다", phone: phone }
      end

      # POST /api/v1/auth/verify_code
      def verify_code
        phone = params[:phone]
        code = params[:code]

        # MVP: 고정 코드 123456
        unless code == "123456"
          Rails.logger.warn "[AUTH] 인증 실패 phone=#{phone} ip=#{request.remote_ip}"
          return render json: { error: "인증코드가 일치하지 않습니다" }, status: :unprocessable_entity
        end

        user = User.find_by(phone: phone)

        # 응답 시간을 통일하여 타이밍 공격 방지
        user = User.find_by(phone: phone)

        if user
          Rails.logger.info "[AUTH] 로그인 성공 user_id=#{user.id} ip=#{request.remote_ip}"
          user.update_columns(phone_verified: true)
          token = JwtService.encode(user_id: user.id)
          render json: { token: token, user: user_response(user), is_new_user: false }
        else
          # phone을 응답에 포함하지 않음 (열거 방지)
          render json: {
            message: "인증이 완료되었습니다",
            phone_verified: true,
            is_new_user: true
          }
        end
      end

      # POST /api/v1/auth/register
      def register
        invite_code_str = params[:invite_code]
        payment_token = params[:payment_token]

        # 시드 유저 여부는 서버에서 마스터 코드로만 판별 (클라이언트 파라미터 무시)
        is_seed = invite_code_str == "ABC123"

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

        # 카카오 정보: 서버에서 토큰 검증 후에만 설정 (클라이언트 직접 설정 차단)
        if params[:kakao_access_token].present?
          kakao_info = KakaoAuthService.get_user_info(params[:kakao_access_token])
          if kakao_info
            user.kakao_id = kakao_info[:kakao_id]
            user.kakao_nickname = kakao_info[:nickname]
            user.kakao_profile_image = kakao_info[:profile_image]
            user.kakao_email = kakao_info[:email]
          end
        end

        if user.save
          Rails.logger.info "[AUTH] 회원가입 user_id=#{user.id} method=#{is_seed ? 'seed' : invite_code_str.present? ? 'invite' : 'paid'} ip=#{request.remote_ip}"
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
      # params: email, organization_name, type (company|university)
      def send_work_email_verification
        email = params[:email]
        organization_name = params[:organization_name]
        verify_type = params[:type] || "company" # company or university

        result = EmailVerificationService.send_verification(
          current_user, email,
          organization_name: organization_name,
          verify_type: verify_type
        )

        if result[:error]
          render json: { error: result[:error] }, status: :unprocessable_entity
        else
          render json: {
            message: "인증 메일이 발송되었습니다",
            organization_name: result[:organization_name],
            organization_type: result[:organization_type],
            verify_type: verify_type
          }
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

      # PUT /api/v1/auth/visibility
      def update_visibility
        current_user.update!(visibility_params)
        render json: { user: user_response(current_user) }
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

      def visibility_params
        params.permit(:show_company, :show_university)
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
          company_verified: user.company_verified,
          company_name: user.show_company? ? user.company_name : nil,
          show_company: user.show_company,
          university_verified: user.university_verified,
          university_name: user.show_university? ? user.university_name : nil,
          show_university: user.show_university,
          created_at: user.created_at
        }
      end
    end
  end
end
