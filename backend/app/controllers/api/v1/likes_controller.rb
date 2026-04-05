module Api
  module V1
    class LikesController < ApplicationController
      # POST /api/v1/posts/:post_id/like
      def create
        post = Post.find(params[:post_id])

        if current_user.blocked?(post.user) || post.user.blocked?(current_user)
          return render json: { error: "차단된 사용자의 게시글입니다" }, status: :forbidden
        end

        like = post.likes.build(user: current_user)

        if like.save
          render json: { liked: true, likes_count: post.reload.likes_count }
        else
          render json: { error: "이미 좋아요했습니다" }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "게시글을 찾을 수 없습니다" }, status: :not_found
      end

      # DELETE /api/v1/posts/:post_id/like
      def destroy
        post = Post.find(params[:post_id])
        like = post.likes.find_by(user: current_user)

        if like&.destroy
          render json: { liked: false, likes_count: post.reload.likes_count }
        else
          render json: { error: "좋아요하지 않은 게시글입니다" }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "게시글을 찾을 수 없습니다" }, status: :not_found
      end
    end
  end
end
