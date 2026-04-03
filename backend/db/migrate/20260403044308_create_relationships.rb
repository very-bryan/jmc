class CreateRelationships < ActiveRecord::Migration[8.0]
  def change
    create_table :relationships do |t|
      t.references :initiator, null: false, foreign_key: { to_table: :users }
      t.references :partner, null: false, foreign_key: { to_table: :users }
      t.integer :relationship_type, default: 0
      t.integer :status, default: 0
      t.datetime :confirmed_at

      t.timestamps
    end
  end
end
