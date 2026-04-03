class CreateReports < ActiveRecord::Migration[8.0]
  def change
    create_table :reports do |t|
      t.references :reporter, null: false, foreign_key: { to_table: :users }
      t.references :reported, null: false, foreign_key: { to_table: :users }
      t.references :reportable, polymorphic: true, null: false
      t.integer :report_type, default: 0
      t.text :reason
      t.integer :status, default: 0

      t.timestamps
    end
  end
end
