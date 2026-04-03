module Api
  module V1
    class ReportsController < ApplicationController
      # POST /api/v1/reports
      def create
        reported_user = User.find(params[:reported_id])
        reportable = find_reportable

        report = current_user.reports_filed.build(
          reported: reported_user,
          reportable: reportable,
          report_type: params[:report_type],
          reason: params[:reason]
        )

        if report.save
          render json: { message: "신고가 접수되었습니다" }, status: :created
        else
          render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "대상을 찾을 수 없습니다" }, status: :not_found
      end

      private

      def find_reportable
        case params[:reportable_type]
        when "User"
          User.find(params[:reportable_id])
        when "Post"
          Post.find(params[:reportable_id])
        when "Message"
          Message.find(params[:reportable_id])
        else
          raise ActiveRecord::RecordNotFound
        end
      end
    end
  end
end
