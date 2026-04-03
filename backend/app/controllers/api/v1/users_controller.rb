module Api
  module V1
    class UsersController < ApplicationController
      # GET /api/v1/users/:id
      def show
        user = User.visible.find(params[:id])

        if current_user.blocked?(user) || user.blocked?(current_user)
          return render json: { error: "접근할 수 없는 프로필입니다" }, status: :forbidden
        end

        render json: { user: public_profile(user) }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "사용자를 찾을 수 없습니다" }, status: :not_found
      end

      private

      def public_profile(user)
        {
          id: user.id,
          nickname: user.nickname,
          age: user.age,
          region: user.region,
          occupation: user.occupation,
          bio: user.bio,
          profile_image_url: user.profile_image_url,
          verification_level: user.verification_level,
          company_verified: user.company_verified,
          company_name: user.show_company? ? user.company_name : nil,
          university_verified: user.university_verified,
          university_name: user.show_university? ? user.university_name : nil,
          desired_marriage_timing: user.desired_marriage_timing,
          smoking: user.smoking,
          drinking: user.drinking,
          value_survey: user.value_survey ? {
            marriage_intention: user.value_survey.marriage_intention,
            children_plan: user.value_survey.children_plan,
            religion: user.value_survey.religion,
            lifestyle_pattern: user.value_survey.lifestyle_pattern,
            relationship_style: user.value_survey.relationship_style
          } : nil,
          recent_posts: user.posts.visible_posts.recent.limit(5).map { |p|
            {
              id: p.id,
              content: p.content,
              mood_tag: p.mood_tag,
              images: p.post_images.order(:position).map { |i| { url: i.image_url } },
              created_at: p.created_at
            }
          }
        }
      end
    end
  end
end
