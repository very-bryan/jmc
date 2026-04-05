class AddShowMbtiToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :show_mbti, :boolean, default: true
  end
end
