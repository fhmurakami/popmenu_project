class CreateMenuEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :menu_entries do |t|
      t.references :menu, null: false, foreign_key: true
      t.references :menu_item, null: false, foreign_key: true
      t.decimal :price, precision: 5, scale: 2, null: false

      t.timestamps
    end

    add_index :menu_entries, [ :menu_id, :menu_item_id ], unique: true
  end
end
