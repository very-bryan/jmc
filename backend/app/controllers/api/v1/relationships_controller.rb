module Api
  module V1
    class RelationshipsController < ApplicationController
      # POST /api/v1/relationships
      def create
        partner = User.find(params[:partner_id])

        relationship = current_user.initiated_relationships.build(
          partner: partner,
          relationship_type: params[:relationship_type] || :dating,
          status: :requested
        )

        if relationship.save
          render json: { message: "요청이 발송되었습니다", relationship: relationship_response(relationship) }, status: :created
        else
          render json: { errors: relationship.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "사용자를 찾을 수 없습니다" }, status: :not_found
      end

      # POST /api/v1/relationships/:id/confirm
      def confirm
        relationship = current_user.received_relationships.find_by!(id: params[:id], status: :requested)
        relationship.update!(status: :confirmed, confirmed_at: Time.current)

        render json: { message: "확인되었습니다", relationship: relationship_response(relationship) }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "요청을 찾을 수 없습니다" }, status: :not_found
      end

      # POST /api/v1/relationships/:id/end_relationship
      def end_relationship
        relationship = Relationship.where(
          "(initiator_id = ? OR partner_id = ?) AND status = ?",
          current_user.id, current_user.id, Relationship.statuses[:confirmed]
        ).find(params[:id])

        relationship.update!(status: :ended)
        current_user.update!(status: :active)

        render json: { message: "재활성화되었습니다" }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "관계를 찾을 수 없습니다" }, status: :not_found
      end

      # POST /api/v1/relationships/solo_graduation
      def solo_graduation
        unless current_user.active?
          return render json: { error: "현재 상태에서는 졸업할 수 없습니다" }, status: :unprocessable_entity
        end

        current_user.update!(status: :graduated)
        AnalyticsService.track("solo_graduation", { user_id: current_user.id })
        render json: { message: "졸업을 축하합니다!" }
      end

      private

      def relationship_response(rel)
        {
          id: rel.id,
          relationship_type: rel.relationship_type,
          status: rel.status,
          confirmed_at: rel.confirmed_at,
          partner: {
            id: rel.partner.id,
            nickname: rel.partner.nickname
          }
        }
      end
    end
  end
end
