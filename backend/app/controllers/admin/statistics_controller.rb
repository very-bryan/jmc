module Admin
  class StatisticsController < BaseController
    def index
      # 가입/인증 통계
      @signup_stats = {
        total: User.count,
        phone_verified: User.where(phone_verified: true).count,
        selfie_verified: User.where(selfie_verified: true).count,
        profile_completed: User.where(profile_completed: true).count,
        verification_rate: User.count > 0 ? (User.verified.count.to_f / User.count * 100).round(1) : 0,
      }

      # 성별 분포
      @gender_stats = User.group(:gender).count

      # 지역 분포
      @region_stats = User.group(:region).count.sort_by { |_, v| -v }.first(10)

      # 나이대 분포
      current_year = Date.today.year
      @age_stats = User.where.not(birth_year: nil).group(
        Arel.sql("CASE
          WHEN #{current_year} - birth_year BETWEEN 19 AND 25 THEN '19-25'
          WHEN #{current_year} - birth_year BETWEEN 26 AND 30 THEN '26-30'
          WHEN #{current_year} - birth_year BETWEEN 31 AND 35 THEN '31-35'
          WHEN #{current_year} - birth_year BETWEEN 36 AND 40 THEN '36-40'
          ELSE '41+'
        END")
      ).count

      # 활동 통계
      @activity_stats = {
        total_posts: Post.count,
        posts_today: Post.where("created_at >= ?", Time.current.beginning_of_day).count,
        total_interests: Interest.count,
        mutual_rate: Interest.count > 0 ? (Interest.accepted.count.to_f / Interest.count * 100).round(1) : 0,
        total_messages: Message.count,
        messages_today: Message.where("created_at >= ?", Time.current.beginning_of_day).count,
      }

      # 매칭/관계 통계
      @matching_stats = {
        total_matches: Match.count,
        active_matches: Match.active.count,
        total_conversations: Conversation.count,
        relationships_dating: Relationship.dating.rel_confirmed.count,
        relationships_graduated: Relationship.graduated.rel_confirmed.count,
      }

      # 안전 통계
      @safety_stats = {
        total_reports: Report.count,
        pending_reports: Report.report_submitted.count,
        resolved_reports: Report.report_resolved.count,
        processing_rate: Report.count > 0 ? ((Report.report_resolved.count + Report.report_dismissed.count).to_f / Report.count * 100).round(1) : 0,
        total_sanctions: Sanction.count,
        active_sanctions: Sanction.active_sanctions.count,
        total_blocks: Block.count,
      }

      # 신고 유형별
      @report_type_stats = Report.group(:report_type).count

      # 일별 가입 추이 (최근 30일)
      @daily_signups = User.where("created_at >= ?", 30.days.ago)
        .group(Arel.sql("DATE(created_at)"))
        .count
        .sort_by { |k, _| k }
    end
  end
end
