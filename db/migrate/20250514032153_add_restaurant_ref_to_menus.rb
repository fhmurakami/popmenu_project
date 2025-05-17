class AddRestaurantRefToMenus < ActiveRecord::Migration[8.0]
  def change
    add_reference :menus, :restaurant, null: false, foreign_key: true

    add_index :menus, [ :name, :restaurant_id ], unique: true
  end
end
