class AddSeparateVerificationFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :company_email, :string
    add_column :users, :company_name, :string
    add_column :users, :company_domain, :string
    add_column :users, :company_verified, :boolean, default: false
    add_column :users, :company_verified_at, :datetime
    add_column :users, :university_email, :string
    add_column :users, :university_name, :string
    add_column :users, :university_domain, :string
    add_column :users, :university_verified, :boolean, default: false
    add_column :users, :university_verified_at, :datetime
    add_column :users, :show_company, :boolean, default: false
    add_column :users, :show_university, :boolean, default: false
    add_column :users, :email_verify_type, :string
  end
end
