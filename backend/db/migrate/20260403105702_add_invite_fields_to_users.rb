class AddInviteFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :invited_by_code, :string
    add_column :users, :paid, :boolean, default: false
    add_column :users, :is_seed_user, :boolean, default: false
  end
end
