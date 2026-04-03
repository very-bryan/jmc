class CreateMatches < ActiveRecord::Migration[8.0]
  def change
    create_table :matches do |t|
      t.references :user1, null: false, foreign_key: { to_table: :users }
      t.references :user2, null: false, foreign_key: { to_table: :users }
      t.integer :status, default: 0
      t.datetime :matched_at

      t.timestamps
    end
    add_index :matches, [ :user1_id, :user2_id ], unique: true
  end
end
