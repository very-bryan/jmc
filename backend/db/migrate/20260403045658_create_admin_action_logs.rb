class CreateAdminActionLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :admin_action_logs do |t|
      t.references :admin_user, null: false, foreign_key: true
      t.string :action, null: false
      t.string :target_type
      t.integer :target_id
      t.jsonb :details, default: {}
      t.string :ip_address

      t.timestamps
    end
    add_index :admin_action_logs, [ :target_type, :target_id ]
    add_index :admin_action_logs, :created_at
  end
end
