module Admin
  class BaseController < ActionController::Base
    protect_from_forgery with: :exception
    layout "admin"
    helper AdminHelper
    before_action :authenticate_admin!
    before_action :check_session_timeout!
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

    # 세션 타임아웃: 30분
    def check_session_timeout!
      return unless current_admin

      if session[:admin_last_active].present? && session[:admin_last_active] < 30.minutes.ago
        session.delete(:admin_user_id)
        session.delete(:admin_last_active)
        redirect_to admin_login_path, alert: "세션이 만료되었습니다. 다시 로그인해주세요."
        return
      end

      session[:admin_last_active] = Time.current
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
