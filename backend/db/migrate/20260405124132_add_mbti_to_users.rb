class AddMbtiToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :mbti, :string
  end
end
