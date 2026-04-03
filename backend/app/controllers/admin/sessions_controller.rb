module Admin
  class SessionsController < BaseController
    skip_before_action :authenticate_admin!, only: [ :new, :create ]

    def new
      redirect_to admin_root_path if current_admin
    end

    def create
      admin = AdminUser.active_admins.find_by(email: params[:email])

      if admin&.authenticate(params[:password])
        session[:admin_user_id] = admin.id
        admin.update!(last_login_at: Time.current)
        AdminActionLog.log!(
          admin_user: admin,
          action: "login",
          ip_address: request.remote_ip
        )
        redirect_to admin_root_path, notice: "로그인되었습니다"
      else
        flash.now[:alert] = "이메일 또는 비밀번호가 올바르지 않습니다"
        render :new, status: :unprocessable_entity
      end
    end

    def destroy
      if current_admin
        AdminActionLog.log!(
          admin_user: current_admin,
          action: "logout",
          ip_address: request.remote_ip
        )
      end
      session.delete(:admin_user_id)
      redirect_to admin_login_path, notice: "로그아웃되었습니다"
    end
  end
end
