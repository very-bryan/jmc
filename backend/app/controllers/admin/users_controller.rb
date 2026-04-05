module Admin
  class UsersController < BaseController
    def index
      @users = User.all

      # Filters
      if params[:q].present?
        q = ActiveRecord::Base.sanitize_sql_like(params[:q])
        @users = @users.where("nickname ILIKE ? OR phone ILIKE ?", "%#{q}%", "%#{q}%")
      end
      @users = @users.where(gender: params[:gender]) if params[:gender].present?
      @users = @users.where(status: params[:status]) if params[:status].present?
      @users = @users.where(verification_level: params[:verification_level]) if params[:verification_level].present?
      @users = @users.where(region: params[:region]) if params[:region].present?

      @users = @users.order(created_at: :desc).page(params[:page]).per(30)
    end

    def show
      @user = User.find(params[:id])
      @posts = @user.posts.order(created_at: :desc).limit(10)
      @sent_interests = @user.sent_interests.includes(:receiver).order(created_at: :desc).limit(10)
      @received_interests = @user.received_interests.includes(:sender).order(created_at: :desc).limit(10)
      @reports_received = @user.reports_received.includes(:reporter).order(created_at: :desc)
      @reports_filed = @user.reports_filed.includes(:reported).order(created_at: :desc)
      @sanctions = @user.sanctions.includes(:admin_user).order(created_at: :desc)

      log_action!("view_user", target: @user)
    end

    def sanction
      @user = User.find(params[:id])

      sanction = @user.sanctions.create!(
        admin_user: current_admin,
        sanction_type: params[:sanction_type],
        reason: params[:reason],
        starts_at: Time.current,
        ends_at: params[:ends_at].present? ? DateTime.parse(params[:ends_at]) : nil,
        active: true
      )

      log_action!("sanction_user", target: @user, details: {
        sanction_type: params[:sanction_type],
        reason: params[:reason]
      })

      redirect_to admin_user_path(@user), notice: "제재가 적용되었습니다: #{sanction_type_label(sanction.sanction_type)}"
    end

    def unsuspend
      @user = User.find(params[:id])
      @user.sanctions.active_sanctions.update_all(active: false)
      @user.update!(status: :active)

      log_action!("unsuspend_user", target: @user)

      redirect_to admin_user_path(@user), notice: "정지가 해제되었습니다"
    end
  end
end
