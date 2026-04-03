module Api
  module V1
    class PreRegistrationsController < ApplicationController
      skip_before_action :authenticate_request

      def create
        reg = PreRegistration.new(reg_params)

        if reg.save
          AnalyticsService.track("pre_registration", {
            gender: reg.gender,
            birth_year: reg.birth_year,
            region: reg.region,
            referral_source: reg.referral_source
          })
          render json: { message: "사전등록이 완료되었습니다!", registration_number: PreRegistration.count }, status: :created
        else
          render json: { errors: reg.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def count
        render json: { count: PreRegistration.count }
      end

      private

      def reg_params
        params.require(:pre_registration).permit(:name, :phone, :gender, :birth_year, :region, :referral_source)
      end
    end
  end
end
