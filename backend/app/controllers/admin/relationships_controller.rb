module Admin
  class RelationshipsController < BaseController
    def index
      @tab = params[:tab] || "dating"

      @relationships = Relationship.includes(:initiator, :partner).order(created_at: :desc)

      case @tab
      when "dating"
        @relationships = @relationships.dating.rel_confirmed
      when "graduated"
        @relationships = @relationships.graduated.rel_confirmed
      when "anomaly"
        # 이상 패턴: 단기간 여러 연애 시작/졸업 반복
        repeat_user_ids = Relationship.where("created_at >= ?", 3.months.ago)
          .group(:initiator_id).having("count(*) >= 3").pluck(:initiator_id)
        @relationships = @relationships.where(initiator_id: repeat_user_ids)
      end

      @relationships = @relationships.page(params[:page]).per(30)
    end
  end
end
