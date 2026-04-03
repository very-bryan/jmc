module Api
  module V1
    class FeedController < ApplicationController
      # GET /api/v1/feed
      def index
        users = filtered_users
        blocked_ids = current_user.blocked_users.pluck(:id) +
                      current_user.blocks_received.pluck(:blocker_id)

        posts = Post.visible_posts
          .where(user_id: users.where.not(id: blocked_ids + [ current_user.id ]).select(:id))
          .includes(:post_images, :user)
          .recent
          .page(params[:page]).per(20)

        render json: {
          posts: posts.map { |p| feed_post(p) },
          meta: {
            current_page: posts.current_page,
            total_pages: posts.total_pages,
            total_count: posts.total_count
          }
        }
      end

      private

      def filtered_users
        scope = User.visible

        filter = current_user.preference_filter
        return scope unless filter

        if filter.preferred_gender.present?
          target_gender = case filter.preferred_gender
          when "prefer_male" then :male
          when "prefer_female" then :female
          else nil
          end
          scope = scope.where(gender: target_gender) if target_gender
        end

        if filter.min_age.present? || filter.max_age.present?
          current_year = Date.today.year
          max_birth_year = filter.min_age.present? ? current_year - filter.min_age : nil
          min_birth_year = filter.max_age.present? ? current_year - filter.max_age : nil

          scope = scope.where("birth_year <= ?", max_birth_year) if max_birth_year
          scope = scope.where("birth_year >= ?", min_birth_year) if min_birth_year
        end

        if filter.preferred_regions.present? && filter.preferred_regions.any?
          scope = scope.where(region: filter.preferred_regions)
        end

        scope
      end

      def feed_post(post)
        {
          id: post.id,
          content: post.content,
          mood_tag: post.mood_tag,
          images: post.post_images.order(:position).map { |i| { url: i.image_url, position: i.position } },
          user: {
            id: post.user.id,
            nickname: post.user.nickname,
            age: post.user.age,
            region: post.user.region,
            profile_image_url: post.user.profile_image_url,
            verification_level: post.user.verification_level
          },
          created_at: post.created_at
        }
      end
    end
  end
end
