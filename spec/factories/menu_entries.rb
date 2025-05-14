FactoryBot.define do
  factory :menu_entry do
    menu
    menu_item
    price { rand(1.0..20.0).round(2) }
  end
end
