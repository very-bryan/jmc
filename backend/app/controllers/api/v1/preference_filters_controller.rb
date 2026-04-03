module Api
  module V1
    class PreferenceFiltersController < ApplicationController
      # GET /api/v1/preference_filter
      def show
        filter = current_user.preference_filter
        render json: { preference_filter: filter }
      end

      # POST /api/v1/preference_filter
      def create
        filter = current_user.build_preference_filter(filter_params)
        if filter.save
          render json: { preference_filter: filter }, status: :created
        else
          render json: { errors: filter.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/preference_filter
      def update
        filter = current_user.preference_filter
        if filter&.update(filter_params)
          render json: { preference_filter: filter }
        else
          render json: { errors: filter&.errors&.full_messages || [ "필터가 없습니다" ] }, status: :unprocessable_entity
        end
      end

      private

      def filter_params
        params.require(:preference_filter).permit(
          :preferred_gender, :min_age, :max_age,
          :preferred_marriage_timing, :preferred_religion,
          :preferred_smoking, :preferred_drinking,
          preferred_regions: []
        )
      end
    end
  end
end
