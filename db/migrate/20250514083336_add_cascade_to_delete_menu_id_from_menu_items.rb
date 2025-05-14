class AddCascadeToDeleteMenuIdFromMenuItems < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :menu_items, :menus
    add_foreign_key :menu_items, :menus, on_delete: :cascade
  end
end
