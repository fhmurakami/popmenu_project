FactoryBot.define do
  factory :menu do
    sequence(:name) { |n| "Menu #{n}" }
    association :restaurant

    factory :menu_with_items do
      transient do
        menu_items_count { 3 }
      end

      after(:create) do |menu, evaluator|
        create_list(:menu_item, evaluator.menu_items_count) do |menu_item|
          create(:menu_entry, menu:, menu_item:)
        end
        menu.reload
      end
    end
  end
end
