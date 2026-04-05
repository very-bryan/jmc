require "rails_helper"

RSpec.describe "Blocks API", type: :request do
  let(:user) { create(:user) }
  let(:target) { create(:user, :female) }

  describe "POST /api/v1/blocks" do
    it "유저 차단 성공" do
      post "/api/v1/blocks", params: { blocked_id: target.id }, headers: auth_headers(user)
      expect(response).to have_http_status(:created)
    end
  end

  describe "DELETE /api/v1/blocks/:id" do
    it "차단 해제 성공" do
      block = Block.create!(blocker: user, blocked: target)
      delete "/api/v1/blocks/#{block.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end
  end
end
