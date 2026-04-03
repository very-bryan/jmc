module Admin
  class ReportsController < BaseController
    def index
      @reports = Report.includes(:reporter, :reported).order(created_at: :desc)

      @reports = @reports.where(report_type: params[:report_type]) if params[:report_type].present?
      @reports = @reports.where(status: params[:status]) if params[:status].present?

      @tab = params[:tab] || "pending"
      case @tab
      when "pending"
        @reports = @reports.report_submitted
      when "processing"
        @reports = @reports.report_reviewing
      when "done"
        @reports = @reports.where(status: [ :resolved, :dismissed ])
      when "repeat"
        repeat_ids = Report.group(:reported_id).having("count(*) >= 3").pluck(:reported_id)
        @reports = @reports.where(reported_id: repeat_ids)
      end

      @reports = @reports.page(params[:page]).per(30)
    end

    def show
      @report = Report.includes(:reporter, :reported, :reportable).find(params[:id])
      @reported_user = @report.reported
      @past_sanctions = @reported_user.sanctions.order(created_at: :desc)
      @report_count = Report.where(reported: @reported_user).count

      log_action!("view_report", target: @report)

      if @report.reportable_type == "Message"
        log_action!("view_dm_for_report", target: @report, details: { message_id: @report.reportable_id })
      end
    end

    def process_report
      @report = Report.find(params[:id])
      @report.update!(status: :resolved)

      if params[:sanction_type].present?
        @report.reported.sanctions.create!(
          admin_user: current_admin,
          sanction_type: params[:sanction_type],
          reason: "신고 처리: #{params[:process_reason]}",
          starts_at: Time.current,
          ends_at: params[:ends_at].present? ? DateTime.parse(params[:ends_at]) : nil,
          active: true
        )
      end

      if params[:delete_content] == "1" && @report.reportable.respond_to?(:status)
        @report.reportable.update!(status: :removed) if @report.reportable.respond_to?(:post_removed!)
      end

      log_action!("process_report", target: @report, details: {
        sanction_type: params[:sanction_type],
        reason: params[:process_reason],
        delete_content: params[:delete_content]
      })

      redirect_to admin_reports_path, notice: "신고가 처리되었습니다"
    end

    def dismiss
      @report = Report.find(params[:id])
      @report.update!(status: :dismissed)

      log_action!("dismiss_report", target: @report, details: { reason: params[:reason] })

      redirect_to admin_reports_path, notice: "신고가 반려되었습니다"
    end
  end
end
