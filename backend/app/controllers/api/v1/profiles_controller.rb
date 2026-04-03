module Api
  module V1
    class ProfilesController < ApplicationController
      # GET /api/v1/profile
      def show
        render json: { user: full_profile(current_user) }
      end

      # PUT /api/v1/profile
      def update
        if current_user.update(profile_params)
          current_user.update!(profile_completed: profile_complete?) unless current_user.profile_completed?
          current_user.update_verification_level!
          render json: { user: full_profile(current_user) }
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/profile/selfie_verify
      def selfie_verify
        # MVP: 셀피 인증은 클라이언트에서 촬영 후 서버로 전송, 간소화 처리
        current_user.update!(selfie_verified: true)
        current_user.update_verification_level!
        render json: { message: "셀피 인증이 완료되었습니다", user: full_profile(current_user) }
      end

      private

      def profile_params
        params.require(:user).permit(
          :nickname, :gender, :birth_year, :region, :occupation,
          :desired_marriage_timing, :education, :height,
          :smoking, :drinking, :bio, :profile_image_url
        )
      end

      def profile_complete?
        user = current_user
        user.nickname.present? && user.gender.present? &&
          user.birth_year.present? && user.region.present? &&
          user.occupation.present? && user.desired_marriage_timing.present?
      end

      def full_profile(user)
        {
          id: user.id,
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
          verification_level: user.verification_level,
          status: user.status,
          value_survey: user.value_survey,
          preference_filter: user.preference_filter
        }
      end
    end
  end
end
