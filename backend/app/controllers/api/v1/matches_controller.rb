module Api
  module V1
    class MatchesController < ApplicationController
      # GET /api/v1/matches
      def index
        matches = current_user.matches.active.includes(:user1, :user2, :conversation)

        render json: {
          matches: matches.map { |m| match_response(m) }
        }
      end

      # GET /api/v1/matches/:id
      def show
        match = current_user.matches.find(params[:id])
        render json: { match: match_response(match) }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "매칭을 찾을 수 없습니다" }, status: :not_found
      end

      private

      def match_response(match)
        other = match.other_user(current_user)
        {
          id: match.id,
          status: match.status,
          matched_at: match.matched_at,
          conversation_id: match.conversation&.id,
          user: {
            id: other.id,
            nickname: other.nickname,
            age: other.age,
            region: other.region,
            profile_image_url: other.profile_image_url,
            verification_level: other.verification_level
          }
        }
      end
    end
  end
end
