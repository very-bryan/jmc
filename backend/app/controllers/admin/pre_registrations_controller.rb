module Admin
  class PreRegistrationsController < BaseController
    def index
      @registrations = PreRegistration.order(created_at: :desc).page(params[:page]).per(50)
      @stats = {
        total: PreRegistration.count,
        male: PreRegistration.male.count,
        female: PreRegistration.female.count,
        today: PreRegistration.where("created_at >= ?", Time.current.beginning_of_day).count
      }
    end
  end
end
