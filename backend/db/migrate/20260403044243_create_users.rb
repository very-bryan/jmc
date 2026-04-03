class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :phone, null: false
      t.boolean :phone_verified, default: false
      t.string :password_digest
      t.string :nickname
      t.integer :gender, default: 0
      t.integer :birth_year
      t.string :region
      t.string :occupation
      t.string :desired_marriage_timing
      t.string :education
      t.integer :height
      t.integer :smoking, default: 0
      t.integer :drinking, default: 0
      t.boolean :selfie_verified, default: false
      t.boolean :profile_completed, default: false
      t.integer :status, default: 0
      t.integer :verification_level, default: 0
      t.text :bio
      t.string :profile_image_url

      t.timestamps
    end
    add_index :users, :phone, unique: true
    add_index :users, :nickname, unique: true
    add_index :users, :status
    add_index :users, :gender
    add_index :users, :region
  end
end
