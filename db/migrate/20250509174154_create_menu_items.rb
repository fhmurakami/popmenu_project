class CreateMenuItems < ActiveRecord::Migration[8.0]
  def change
    create_table :menu_items do |t|
      t.string :name, null: false, index: { unique: true }
      t.text :description
      t.decimal :price, null: false, precision: 5, scale: 2
      t.string :category
      t.string :dietary_restrictions
      t.text :ingredients
    end
  end
end
