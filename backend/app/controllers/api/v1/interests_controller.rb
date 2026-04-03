module Api
  module V1
    class InterestsController < ApplicationController
      # GET /api/v1/interests
      def index
        tab = params[:tab] || "sent"

        interests = case tab
        when "sent"
          current_user.sent_interests.includes(:receiver).recent_first
        when "received"
          current_user.received_interests.includes(:sender).recent_first
        when "mutual"
          current_user.sent_interests.accepted.includes(:receiver)
        end

        render json: {
          interests: interests.map { |i| interest_response(i, tab) },
          tab: tab
        }
      end

      # POST /api/v1/interests
      def create
        receiver = User.visible.find(params[:receiver_id])
        interest = current_user.sent_interests.build(receiver: receiver)

        if interest.save
          render json: { interest: interest_response(interest, "sent") }, status: :created
        else
          render json: { errors: interest.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "사용자를 찾을 수 없습니다" }, status: :not_found
      end

      # POST /api/v1/interests/:id/accept
      def accept
        interest = current_user.received_interests.pending.find(params[:id])
        interest.update!(status: :accepted)

        # Create match and conversation
        user_ids = [ interest.sender_id, interest.receiver_id ].sort
        match = Match.create!(
          user1_id: user_ids.first,
          user2_id: user_ids.last,
          status: :active,
          matched_at: Time.current
        )
        Conversation.create!(match: match, status: :active, last_message_at: Time.current)

        render json: { message: "상호 관심이 성립되었습니다!", match_id: match.id }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "관심을 찾을 수 없습니다" }, status: :not_found
      end

      # POST /api/v1/interests/:id/decline
      def decline
        interest = current_user.received_interests.pending.find(params[:id])
        interest.update!(status: :declined)
        render json: { message: "관심을 거절했습니다" }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "관심을 찾을 수 없습니다" }, status: :not_found
      end

      private

      def interest_response(interest, tab)
        target = tab == "received" ? interest.sender : interest.receiver
        {
          id: interest.id,
          status: interest.status,
          user: {
            id: target.id,
            nickname: target.nickname,
            age: target.age,
            region: target.region,
            profile_image_url: target.profile_image_url,
            verification_level: target.verification_level
          },
          created_at: interest.created_at
        }
      end
    end
  end
end
