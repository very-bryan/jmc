module Api
  module V1
    class InviteCodesController < ApplicationController
      # GET /api/v1/invite_codes
      def index
        codes = current_user.owned_invite_codes.order(created_at: :desc)

        render json: {
          codes: codes.map { |c| code_response(c) },
          available_count: current_user.invite_code_count,
          total_count: codes.count
        }
      end

      # POST /api/v1/invite_codes/validate
      def validate
        code = InviteCode.validate_code(params[:code])

        if code
          render json: { valid: true, owner_nickname: code.owner.nickname }
        else
          render json: { valid: false, error: "유효하지 않은 초대코드입니다" }
        end
      end

      private

      def code_response(code)
        {
          id: code.id,
          code: code.code,
          status: code.status,
          used_by: code.used_by ? { id: code.used_by.id, nickname: code.used_by.nickname } : nil,
          used_at: code.used_at,
          created_at: code.created_at
        }
      end
    end
  end
end
