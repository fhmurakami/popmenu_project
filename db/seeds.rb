# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
if Rails.env.development?
  require "factory_bot_rails"
  include FactoryBot::Syntax::Methods

  # Create a restaurant
  restaurant = create(
    :restaurant,
    name: "The Restaurant",
    address: "123 Main St, Anytown, USA",
    phone: "555-1234"
  )

  # Create a menu
  menu = create(:menu, name: "Lunch Menu", restaurant: restaurant)

  # Create menu items
  caesar_salad = create(:menu_item, name: "Caesar Salad")
  chicken_sandwich = create(:menu_item, name: "Grilled Chicken Sandwich")

  # Create menu entries
  caesar_salad_attributes = {
    description: "Crisp romaine lettuce with Caesar dressing",
    price: 8.99,
    category: "Salad",
    dietary_restrictions: "Vegetarian",
    ingredients: "Romaine lettuce, Caesar dressing, croutons",
    menu_id: menu.id
  }

  chicken_sandwich_attributes = {
    description: "Grilled chicken breast with lettuce and tomato",
    price: 10.99,
    category: "Sandwich",
    dietary_restrictions: "None",
    ingredients: "Australian Bread, Grilled chicken, lettuce, tomato, mayonnaise",
    menu_id: menu.id
  }

  create(:menu_entry, menu:, menu_item: caesar_salad, **caesar_salad_attributes)
  create(:menu_entry, menu:, menu_item: chicken_sandwich, **chicken_sandwich_attributes)
end
