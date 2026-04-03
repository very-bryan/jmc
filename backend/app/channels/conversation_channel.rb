class ConversationChannel < ApplicationCable::Channel
  def subscribed
    conversation = Conversation.find(params[:conversation_id])
    match = conversation.match

    if match.includes_user?(current_user)
      stream_from "conversation_#{conversation.id}"
    else
      reject
    end
  end

  def unsubscribed
    stop_all_streams
  end

  def receive(data)
    conversation = Conversation.find(params[:conversation_id])

    message = conversation.messages.create!(
      sender: current_user,
      content: data["content"],
      message_type: data["message_type"] || "text",
      metadata: { read: false }
    )

    ActionCable.server.broadcast(
      "conversation_#{conversation.id}",
      {
        id: message.id,
        content: message.content,
        message_type: message.message_type,
        sender_id: message.sender_id,
        read: false,
        created_at: message.created_at
      }
    )
  end
end
