FactoryBot.define do
  factory :menu_item do
    sequence(:name) { "Menu Item #{_1}" }
  end
end
