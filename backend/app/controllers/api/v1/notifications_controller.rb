module Api
  module V1
    class NotificationsController < ApplicationController
      # GET /api/v1/notifications
      def index
        notifications = current_user.notifications.recent
          .page(params[:page]).per(30)

        render json: {
          notifications: notifications.map { |n| notification_response(n) },
          unread_count: current_user.notifications.unread.count,
          meta: {
            current_page: notifications.current_page,
            total_pages: notifications.total_pages,
            total_count: notifications.total_count
          }
        }
      end

      # GET /api/v1/notifications/unread_count
      def unread_count
        render json: { unread_count: current_user.notifications.unread.count }
      end

      # POST /api/v1/notifications/read_all
      def read_all
        current_user.notifications.unread.update_all(read: true)
        render json: { message: "모두 읽음 처리되었습니다" }
      end

      # POST /api/v1/notifications/:id/read
      def read
        notification = current_user.notifications.find(params[:id])
        notification.update!(read: true)
        render json: { notification: notification_response(notification) }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "알림을 찾을 수 없습니다" }, status: :not_found
      end

      private

      def notification_response(n)
        {
          id: n.id,
          type: n.notification_type,
          title: n.title,
          body: n.body,
          read: n.read,
          actor: n.actor ? {
            id: n.actor.id,
            nickname: n.actor.nickname,
            profile_image_url: n.actor.profile_image_url
          } : nil,
          target_type: n.target_type,
          target_id: n.target_id,
          created_at: n.created_at
        }
      end
    end
  end
end
