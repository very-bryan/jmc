class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages do |t|
      t.references :conversation, null: false, foreign_key: true
      t.references :sender, null: false, foreign_key: { to_table: :users }
      t.text :content
      t.integer :message_type, default: 0
      t.jsonb :metadata, default: {}

      t.timestamps
    end
    add_index :messages, :metadata, using: :gin
  end
end
