class CreateValueSurveys < ActiveRecord::Migration[8.0]
  def change
    create_table :value_surveys do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :marriage_intention
      t.integer :children_plan
      t.string :religion
      t.integer :lifestyle_pattern
      t.integer :spending_tendency
      t.integer :relationship_style
      t.integer :conflict_resolution

      t.timestamps
    end
  end
end
