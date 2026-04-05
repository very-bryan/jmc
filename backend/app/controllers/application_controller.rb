class ApplicationController < ActionController::API
  before_action :authenticate_request

  private

  def authenticate_request
    header = request.headers["Authorization"]
    token = header&.split(" ")&.last
    decoded = JwtService.decode(token)

    if decoded
      @current_user = User.find_by(id: decoded[:user_id])
    end

    unless @current_user
      return render json: { error: "인증이 필요합니다" }, status: :unauthorized
    end

    # 정지/졸업/휴면 유저 차단
    if @current_user.suspended?
      return render json: { error: "계정이 정지되었습니다" }, status: :forbidden
    end

    if @current_user.graduated? || @current_user.dormant?
      return render json: { error: "비활성화된 계정입니다. 휴면해제가 필요합니다" }, status: :forbidden
    end
  end

  def current_user
    @current_user
  end
end
