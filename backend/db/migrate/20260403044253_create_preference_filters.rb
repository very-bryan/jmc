class CreatePreferenceFilters < ActiveRecord::Migration[8.0]
  def change
    create_table :preference_filters do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :preferred_gender
      t.integer :min_age
      t.integer :max_age
      t.text :preferred_regions
      t.string :preferred_marriage_timing
      t.string :preferred_religion
      t.integer :preferred_smoking
      t.integer :preferred_drinking

      t.timestamps
    end
  end
end
