module Api
  module V1
    class ConversationsController < ApplicationController
      # GET /api/v1/conversations
      def index
        match_ids = current_user.matches.pluck(:id)
        conversations = Conversation.where(match_id: match_ids)
          .active
          .includes(match: [ :user1, :user2 ])
          .recent

        render json: {
          conversations: conversations.map { |c| conversation_response(c) }
        }
      end

      # GET /api/v1/conversations/:id
      def show
        conversation = find_conversation
        render json: { conversation: conversation_response(conversation) }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "대화를 찾을 수 없습니다" }, status: :not_found
      end

      private

      def find_conversation
        match_ids = current_user.matches.pluck(:id)
        Conversation.where(match_id: match_ids).find(params[:id])
      end

      def conversation_response(conv)
        other = conv.other_participant(current_user)
        last_message = conv.messages.order(created_at: :desc).first

        {
          id: conv.id,
          status: conv.status,
          last_message_at: conv.last_message_at,
          last_message: last_message ? {
            content: last_message.content,
            sender_id: last_message.sender_id,
            created_at: last_message.created_at,
            read: last_message.read?
          } : nil,
          user: {
            id: other.id,
            nickname: other.nickname,
            age: other.age,
            region: other.region,
            profile_image_url: other.profile_image_url
          }
        }
      end
    end
  end
end
