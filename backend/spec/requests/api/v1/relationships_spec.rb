require "rails_helper"

RSpec.describe "Relationships API", type: :request do
  let(:initiator) { create(:user) }
  let(:partner) { create(:user, :female) }

  describe "POST /api/v1/relationships" do
    it "졸업 신청 성공" do
      post "/api/v1/relationships",
        params: { partner_id: partner.id, relationship_type: "graduated" },
        headers: auth_headers(initiator)

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["relationship"]["status"]).to eq("requested")
    end

    it "자기 자신에게 졸업 신청 거부" do
      post "/api/v1/relationships",
        params: { partner_id: initiator.id, relationship_type: "graduated" },
        headers: auth_headers(initiator)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/relationships/:id/confirm" do
    it "파트너가 졸업 수락 → 양쪽 graduated" do
      rel = Relationship.create!(
        initiator: initiator, partner: partner,
        relationship_type: :graduated, status: :requested
      )

      post "/api/v1/relationships/#{rel.id}/confirm", headers: auth_headers(partner)

      expect(response).to have_http_status(:ok)
      expect(initiator.reload.status).to eq("graduated")
      expect(partner.reload.status).to eq("graduated")
    end

    it "신청자가 수락 시도 → 404" do
      rel = Relationship.create!(
        initiator: initiator, partner: partner,
        relationship_type: :graduated, status: :requested
      )

      post "/api/v1/relationships/#{rel.id}/confirm", headers: auth_headers(initiator)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/relationships/solo_graduation" do
    it "active 유저 혼자 졸업 성공" do
      post "/api/v1/relationships/solo_graduation", headers: auth_headers(initiator)

      expect(response).to have_http_status(:ok)
      expect(initiator.reload.status).to eq("graduated")
    end

    it "이미 graduated인 유저 거부" do
      graduated_user = create(:user, :graduated)
      post "/api/v1/relationships/solo_graduation", headers: auth_headers(graduated_user)

      expect(response).to have_http_status(:forbidden)
    end

    it "suspended 유저 거부" do
      suspended_user = create(:user, :suspended)
      post "/api/v1/relationships/solo_graduation", headers: auth_headers(suspended_user)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/relationships/:id/end_relationship" do
    it "연애 종료 → active로 복귀" do
      rel = Relationship.create!(
        initiator: initiator, partner: partner,
        relationship_type: :dating, status: :confirmed,
        confirmed_at: Time.current
      )
      initiator.update_column(:status, User.statuses[:in_relationship])
      partner.update_column(:status, User.statuses[:in_relationship])

      post "/api/v1/relationships/#{rel.id}/end_relationship", headers: auth_headers(initiator)

      expect(response).to have_http_status(:ok)
      expect(initiator.reload.status).to eq("active")
      expect(partner.reload.status).to eq("active")
    end
  end
end
