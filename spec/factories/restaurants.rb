FactoryBot.define do
  factory :restaurant do
    name { "My Restaurant" }
    address { "Avenue Ruby on Rails, 802" }
    phone { "123 456-7890" }
    website { "myrestaurant.com" }
    description { "My super famous restaurant" }
  end
end
