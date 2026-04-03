class CreateOrganizationDomains < ActiveRecord::Migration[8.0]
  def change
    create_table :organization_domains do |t|
      t.string :domain, null: false
      t.string :organization_name
      t.integer :organization_type, default: 0
      t.boolean :verified, default: false
      t.integer :verified_by, default: 0
      t.integer :user_count, default: 0
      t.float :ai_confidence
      t.text :ai_raw_response

      t.timestamps
    end
    add_index :organization_domains, :domain, unique: true
    add_index :organization_domains, :verified
  end
end
