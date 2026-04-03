module Api
  module V1
    class ValueSurveysController < ApplicationController
      # GET /api/v1/value_survey
      def show
        survey = current_user.value_survey
        if survey
          render json: { value_survey: survey }
        else
          render json: { value_survey: nil }
        end
      end

      # POST /api/v1/value_survey
      def create
        survey = current_user.build_value_survey(survey_params)
        if survey.save
          render json: { value_survey: survey }, status: :created
        else
          render json: { errors: survey.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/value_survey
      def update
        survey = current_user.value_survey
        if survey&.update(survey_params)
          render json: { value_survey: survey }
        else
          render json: { errors: survey&.errors&.full_messages || [ "설문이 없습니다" ] }, status: :unprocessable_entity
        end
      end

      private

      def survey_params
        params.require(:value_survey).permit(
          :marriage_intention, :children_plan, :religion,
          :lifestyle_pattern, :spending_tendency,
          :relationship_style, :conflict_resolution
        )
      end
    end
  end
end
