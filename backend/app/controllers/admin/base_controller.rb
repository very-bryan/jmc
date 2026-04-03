module Admin
  class BaseController < ActionController::Base
    protect_from_forgery with: :exception
    layout "admin"
    helper AdminHelper
    before_action :authenticate_admin!
    helper_method :current_admin

    private

    def authenticate_admin!
      unless current_admin
        redirect_to admin_login_path, alert: "로그인이 필요합니다"
      end
    end

    def current_admin
      @current_admin ||= AdminUser.find_by(id: session[:admin_user_id], active: true)
    end

    def require_role!(*roles)
      unless roles.include?(current_admin.role.to_sym)
        redirect_to admin_root_path, alert: "접근 권한이 없습니다"
      end
    end

    def log_action!(action, target: nil, details: {})
      AdminActionLog.log!(
        admin_user: current_admin,
        action: action,
        target: target,
        details: details,
        ip_address: request.remote_ip
      )
    end
  end
end
