module Admin
  class PostsController < BaseController
    def index
      @posts = Post.includes(:user, :post_images).order(created_at: :desc)

      @posts = @posts.where(user_id: User.where("nickname ILIKE ?", "%#{params[:q]}%")) if params[:q].present?
      @posts = @posts.where(status: params[:status]) if params[:status].present?

      @tab = params[:tab] || "all"
      if @tab == "reported"
        reported_post_ids = Report.where(reportable_type: "Post").pluck(:reportable_id)
        @posts = @posts.where(id: reported_post_ids)
      end

      @posts = @posts.page(params[:page]).per(30)
    end

    def show
      @post = Post.includes(:user, :post_images).find(params[:id])
      @reports = Report.where(reportable: @post).includes(:reporter)
    end

    def hide
      post = Post.find(params[:id])
      post.update!(status: :hidden)
      log_action!("hide_post", target: post)
      redirect_to admin_posts_path, notice: "게시글이 비공개 처리되었습니다"
    end

    def remove
      post = Post.find(params[:id])
      post.update!(status: :removed)
      log_action!("remove_post", target: post)
      redirect_to admin_posts_path, notice: "게시글이 삭제되었습니다"
    end
  end
end
