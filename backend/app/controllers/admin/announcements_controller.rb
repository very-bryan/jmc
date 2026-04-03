module Admin
  class AnnouncementsController < BaseController
    def index
      @announcements = Announcement.includes(:admin_user).recent.page(params[:page]).per(20)
    end

    def new
      @announcement = Announcement.new
    end

    def create
      @announcement = current_admin.announcements.build(announcement_params)

      if @announcement.save
        log_action!("create_announcement", target: @announcement)
        redirect_to admin_announcements_path, notice: "공지사항이 작성되었습니다"
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
      @announcement = Announcement.find(params[:id])
    end

    def update
      @announcement = Announcement.find(params[:id])

      if @announcement.update(announcement_params)
        log_action!("update_announcement", target: @announcement)
        redirect_to admin_announcements_path, notice: "공지사항이 수정되었습니다"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @announcement = Announcement.find(params[:id])
      @announcement.destroy!
      log_action!("delete_announcement", target: @announcement)
      redirect_to admin_announcements_path, notice: "공지사항이 삭제되었습니다"
    end

    private

    def announcement_params
      params.require(:announcement).permit(:title, :content, :target_audience, :starts_at, :ends_at, :active)
    end
  end
end
