module Api
  module V1
    class MessagesController < ApplicationController
      # GET /api/v1/conversations/:conversation_id/messages
      def index
        conversation = find_conversation
        messages = conversation.messages
          .includes(:sender)
          .order(created_at: :desc)
          .page(params[:page]).per(50)

        # Mark unread messages as read
        conversation.messages
          .where.not(sender: current_user)
          .where("metadata->>'read' IS NULL OR metadata->>'read' = 'false'")
          .find_each(&:mark_as_read!)

        render json: {
          messages: messages.map { |m| message_response(m) },
          meta: {
            current_page: messages.current_page,
            total_pages: messages.total_pages,
            total_count: messages.total_count
          }
        }
      end

      # POST /api/v1/conversations/:conversation_id/messages
      def create
        conversation = find_conversation
        message = conversation.messages.build(
          sender: current_user,
          content: params[:content],
          message_type: params[:message_type] || :text,
          metadata: { read: false }
        )

        if message.save
          broadcast_message(conversation, message)
          render json: { message: message_response(message) }, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def find_conversation
        match_ids = current_user.matches.pluck(:id)
        Conversation.where(match_id: match_ids).find(params[:conversation_id])
      end

      def message_response(msg)
        {
          id: msg.id,
          content: msg.content,
          message_type: msg.message_type,
          sender_id: msg.sender_id,
          is_mine: msg.sender_id == current_user.id,
          read: msg.read?,
          created_at: msg.created_at
        }
      end

      def broadcast_message(conversation, message)
        ActionCable.server.broadcast(
          "conversation_#{conversation.id}",
          message_response(message)
        )
      rescue StandardError
        # Action Cable not available in production without Redis
      end
    end
  end
end
