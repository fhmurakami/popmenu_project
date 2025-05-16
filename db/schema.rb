# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_05_16_035635) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "menu_entries", force: :cascade do |t|
    t.bigint "menu_id", null: false
    t.bigint "menu_item_id", null: false
    t.decimal "price", precision: 5, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["menu_id", "menu_item_id"], name: "index_menu_entries_on_menu_id_and_menu_item_id", unique: true
    t.index ["menu_id"], name: "index_menu_entries_on_menu_id"
    t.index ["menu_item_id"], name: "index_menu_entries_on_menu_item_id"
  end

  create_table "menu_items", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.decimal "price", precision: 5, scale: 2, null: false
    t.string "category"
    t.string "dietary_restrictions"
    t.text "ingredients"
    t.bigint "menu_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["menu_id"], name: "index_menu_items_on_menu_id"
    t.index ["name"], name: "index_menu_items_on_name", unique: true
  end

  create_table "menus", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "restaurant_id", null: false
    t.index ["name", "restaurant_id"], name: "index_menus_on_name_and_restaurant_id", unique: true
    t.index ["restaurant_id"], name: "index_menus_on_restaurant_id"
  end

  create_table "restaurants", force: :cascade do |t|
    t.string "name", null: false
    t.string "address"
    t.string "phone"
    t.string "website"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_restaurants_on_name", unique: true
  end

  add_foreign_key "menu_entries", "menu_items"
  add_foreign_key "menu_entries", "menus"
  add_foreign_key "menu_items", "menus", on_delete: :cascade
  add_foreign_key "menus", "restaurants"
end
