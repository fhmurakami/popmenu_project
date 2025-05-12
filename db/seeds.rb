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

  # Create a menu
  menu = create(:menu, name: "Lunch Menu")

  # Create menu items
  [
    {
      name: "Caesar Salad",
      description: "Crisp romaine lettuce with Caesar dressing",
      price: 8.99,
      category: "Salad",
      dietary_restrictions: "Vegetarian",
      ingredients: "Romaine lettuce, Caesar dressing, croutons",
      menu_id: menu.id
    },
    {
      name: "Grilled Chicken Sandwich",
      description: "Grilled chicken breast with lettuce and tomato",
      price: 10.99,
      category: "Sandwich",
      dietary_restrictions: "None",
      ingredients: "Australian Bread, Grilled chicken, lettuce, tomato, mayonnaise",
      menu_id: menu.id
    }
  ].map do |attributes|
    create(:menu_item, attributes)
  end
end