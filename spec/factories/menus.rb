FactoryBot.define do
  factory :menu do
    sequence(:name) { |n| "Menu #{n}" }

    factory :menu_with_items do
      transient do
        menu_items_count { 3 }
      end

      after(:create) do |menu, evaluator|
        create_list(:menu_item, evaluator.menu_items_count, menu_id: menu.id) do |item|
          create(:menu_entry, menu: menu, menu_item: item)
        end
        menu.reload
      end
    end
  end
end
