class MoveAttributesFromMenuItemToMenuEntry < ActiveRecord::Migration[8.0]
  def change
    # Step 1: Add columns to menu_entries table
    add_column :menu_entries, :description, :text
    add_column :menu_entries, :category, :string
    add_column :menu_entries, :dietary_restrictions, :string
    add_column :menu_entries, :ingredients, :text

    # Step 2: Copy data from menu_items to menu_entries
    execute <<-SQL
      UPDATE menu_entries me
      SET
        description = mi.description,
        category = mi.category,
        dietary_restrictions = mi.dietary_restrictions,
        ingredients = mi.ingredients
      FROM menu_items mi
      WHERE me.menu_item_id = mi.id;
    SQL

    # Step 3: Remove columns from menu_items table (except name)
    # Step 3.1: remove foreign key contraint
    remove_foreign_key :menu_items, :menus

    # Step 3.2: remove columns
    remove_column :menu_items, :description
    remove_column :menu_items, :price
    remove_column :menu_items, :category
    remove_column :menu_items, :dietary_restrictions
    remove_column :menu_items, :ingredients
    remove_column :menu_items, :menu_id
  end
end
