FactoryBot.define do
  factory :menu_item do
    sequence(:name) { |n| "Cheese Burguer #{n}" }
    description { "Delicious cheese burguer" }
    price { 9.99 }
    category { "Main Course" }
    dietary_restrictions { "None" }
    ingredients { "Beef, Bread, Cheese, Lettuce, Tomato" }
  end
end
