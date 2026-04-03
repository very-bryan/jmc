class CreatePreRegistrations < ActiveRecord::Migration[8.0]
  def change
    create_table :pre_registrations do |t|
      t.string :name, null: false
      t.string :phone, null: false
      t.integer :gender, default: 0
      t.integer :birth_year
      t.string :region
      t.string :referral_source

      t.timestamps
    end
    add_index :pre_registrations, :phone, unique: true
  end
end
