module Api
  module V1
    class PostsController < ApplicationController
      # GET /api/v1/posts
      def index
        posts = current_user.posts.visible_posts.recent
          .includes(:post_images, :user)
          .page(params[:page]).per(20)

        render json: {
          posts: posts.map { |p| post_response(p) },
          meta: pagination_meta(posts)
        }
      end

      # GET /api/v1/posts/:id
      def show
        post = Post.visible_posts.includes(:post_images, :user).find(params[:id])
        render json: { post: post_response(post) }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "게시글을 찾을 수 없습니다" }, status: :not_found
      end

      # POST /api/v1/posts
      def create
        post = current_user.posts.build(post_params)
        post.status = :published

        if post.save
          render json: { post: post_response(post) }, status: :created
        else
          render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/posts/:id
      def destroy
        post = current_user.posts.find(params[:id])
        post.update!(status: :removed)
        render json: { message: "게시글이 삭제되었습니다" }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "게시글을 찾을 수 없습니다" }, status: :not_found
      end

      private

      def post_params
        params.require(:post).permit(
          :content, :mood_tag, :visibility,
          post_images_attributes: [ :image_url, :position ]
        )
      end

      def post_response(post)
        {
          id: post.id,
          content: post.content,
          mood_tag: post.mood_tag,
          visibility: post.visibility,
          images: post.post_images.order(:position).map { |i| { url: i.image_url, position: i.position } },
          user: {
            id: post.user.id,
            nickname: post.user.nickname,
            age: post.user.age,
            region: post.user.region,
            profile_image_url: post.user.profile_image_url,
            verification_level: post.user.verification_level
          },
          created_at: post.created_at
        }
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count
        }
      end
    end
  end
end
