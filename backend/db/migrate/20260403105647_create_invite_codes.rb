class CreateInviteCodes < ActiveRecord::Migration[8.0]
  def change
    create_table :invite_codes do |t|
      t.string :code, null: false
      t.references :owner, null: false, foreign_key: { to_table: :users }
      t.references :used_by, null: true, foreign_key: { to_table: :users }
      t.integer :status, default: 0
      t.datetime :used_at

      t.timestamps
    end
    add_index :invite_codes, :code, unique: true
    add_index :invite_codes, [ :owner_id, :status ]
  end
end
