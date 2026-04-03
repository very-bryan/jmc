module Api
  module V1
    class BlocksController < ApplicationController
      # GET /api/v1/blocks
      def index
        blocks = current_user.blocks_given.includes(:blocked)
        render json: {
          blocks: blocks.map { |b|
            {
              id: b.id,
              user: {
                id: b.blocked.id,
                nickname: b.blocked.nickname,
                profile_image_url: b.blocked.profile_image_url
              },
              created_at: b.created_at
            }
          }
        }
      end

      # POST /api/v1/blocks
      def create
        blocked_user = User.find(params[:blocked_id])
        block = current_user.blocks_given.build(blocked: blocked_user)

        if block.save
          render json: { message: "차단되었습니다" }, status: :created
        else
          render json: { errors: block.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "사용자를 찾을 수 없습니다" }, status: :not_found
      end

      # DELETE /api/v1/blocks/:id
      def destroy
        block = current_user.blocks_given.find(params[:id])
        block.destroy!
        render json: { message: "차단이 해제되었습니다" }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "차단 기록을 찾을 수 없습니다" }, status: :not_found
      end
    end
  end
end
