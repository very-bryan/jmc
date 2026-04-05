module Admin
  class OrganizationDomainsController < BaseController
    before_action -> { require_role!(:super_admin, :ops_admin) }

    def index
      @tab = params[:tab] || "pending"

      @domains = OrganizationDomain.order(created_at: :desc)

      case @tab
      when "pending"
        @domains = @domains.where(verified: false)
      when "verified"
        @domains = @domains.where(verified: true)
      end

      @domains = @domains.page(params[:page]).per(50)
      @pending_count = OrganizationDomain.where(verified: false).count
    end

    def verify
      domain = OrganizationDomain.find(params[:id])
      domain.update!(
        organization_name: params[:organization_name] || domain.organization_name,
        organization_type: params[:organization_type] || domain.organization_type,
        verified: true,
        verified_by: :admin_verified
      )
      log_action!("verify_org_domain", target: domain, details: { name: domain.organization_name })
      redirect_to admin_organization_domains_path, notice: "#{domain.domain} → #{domain.organization_name} 승인됨"
    end

    def reject
      domain = OrganizationDomain.find(params[:id])
      domain.destroy!
      log_action!("reject_org_domain", target: domain)
      redirect_to admin_organization_domains_path, notice: "#{domain.domain} 거부됨"
    end
  end
end
