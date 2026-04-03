class CreateAnnouncements < ActiveRecord::Migration[8.0]
  def change
    create_table :announcements do |t|
      t.references :admin_user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :content, null: false
      t.integer :target_audience, default: 0
      t.datetime :starts_at
      t.datetime :ends_at
      t.boolean :active, default: true

      t.timestamps
    end
  end
end
