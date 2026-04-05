require "rails_helper"

RSpec.describe "Interests API", type: :request do
  let(:sender) { create(:user) }
  let(:receiver) { create(:user, :female) }

  describe "POST /api/v1/interests" do
    it "관심 보내기 성공" do
      post "/api/v1/interests", params: { receiver_id: receiver.id }, headers: auth_headers(sender)
      expect(response).to have_http_status(:created)
    end
  end

  describe "POST /api/v1/interests/:id/accept" do
    it "관심 수락 성공" do
      interest = Interest.create!(sender: sender, receiver: receiver, status: :pending)

      post "/api/v1/interests/#{interest.id}/accept", headers: auth_headers(receiver)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/v1/interests/:id/decline" do
    it "관심 거절 성공" do
      interest = Interest.create!(sender: sender, receiver: receiver, status: :pending)

      post "/api/v1/interests/#{interest.id}/decline", headers: auth_headers(receiver)
      expect(response).to have_http_status(:ok)
    end
  end
end
