module Admin
  class DashboardController < BaseController
    def index
      today = Time.current.beginning_of_day
      this_week = Time.current.beginning_of_week
      this_month = Time.current.beginning_of_month

      @stats = {
        today: {
          new_users: User.where("created_at >= ?", today).count,
          new_matches: Match.where("matched_at >= ?", today).count,
          new_relationships: Relationship.where("confirmed_at >= ?", today).rel_confirmed.count,
          graduations: Relationship.where("confirmed_at >= ?", today).graduated.count,
          pending_reports: Report.report_submitted.count,
          sanctions_today: Sanction.where("created_at >= ?", today).count,
        },
        this_week: {
          new_users: User.where("created_at >= ?", this_week).count,
          new_matches: Match.where("matched_at >= ?", this_week).count,
        },
        this_month: {
          new_users: User.where("created_at >= ?", this_month).count,
          new_matches: Match.where("matched_at >= ?", this_month).count,
        },
        totals: {
          total_users: User.count,
          active_users: User.active.count,
          verified_users: User.verified.count,
          total_posts: Post.count,
          total_matches: Match.count,
          total_conversations: Conversation.count,
        }
      }

      @pending_reports = Report.report_submitted.count
      @pending_verifications = User.where(selfie_verified: false, phone_verified: true).count
      @recent_logs = AdminActionLog.recent.includes(:admin_user).limit(10)
    end
  end
end
