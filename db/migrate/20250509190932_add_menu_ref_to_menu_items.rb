class AddMenuRefToMenuItems < ActiveRecord::Migration[8.0]
  def change
    add_reference :menu_items, :menu, null: false, foreign_key: true
  end
end
