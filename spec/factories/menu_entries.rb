FactoryBot.define do
  factory :menu_entry do
    association :menu
    association :menu_item
    price { rand(1.0..20.0).round(2) }

    factory :complete_menu_entry do
      description { "Delicious dish" }
      category { "Main Course" }
      dietary_restrictions { "None" }
      ingredients { "Beef, Bread, Cheese, Lettuce, Tomato" }
    end
  end
end
