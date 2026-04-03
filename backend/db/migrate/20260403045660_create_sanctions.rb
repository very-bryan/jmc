class CreateSanctions < ActiveRecord::Migration[8.0]
  def change
    create_table :sanctions do |t|
      t.references :admin_user, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :sanction_type, default: 0
      t.text :reason, null: false
      t.datetime :starts_at
      t.datetime :ends_at
      t.boolean :active, default: true

      t.timestamps
    end
    add_index :sanctions, [ :user_id, :active ]
  end
end
