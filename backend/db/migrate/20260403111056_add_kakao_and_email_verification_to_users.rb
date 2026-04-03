class AddKakaoAndEmailVerificationToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :kakao_id, :string
    add_index :users, :kakao_id, unique: true
    add_column :users, :kakao_nickname, :string
    add_column :users, :kakao_profile_image, :string
    add_column :users, :kakao_email, :string
    add_column :users, :work_email, :string
    add_column :users, :work_email_verified, :boolean, default: false
    add_column :users, :work_email_verified_at, :datetime
    add_column :users, :work_email_domain, :string
    add_column :users, :email_verification_token, :string
  end
end
