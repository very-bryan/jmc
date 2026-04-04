class CreateNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :notification_type, default: 0
      t.string :title, null: false
      t.string :body
      t.integer :actor_id
      t.string :target_type
      t.integer :target_id
      t.boolean :read, default: false

      t.timestamps
    end
    add_index :notifications, [:user_id, :read]
    add_index :notifications, [:user_id, :created_at]
  end
end
