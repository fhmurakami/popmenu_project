require 'rails_helper'

RSpec.describe Restaurant, type: :model do
  describe 'validations' do
    subject { FactoryBot.build(:restaurant) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }

    it 'does not allow names with only whitespace' do
      restaurant = build(:restaurant, name: '   ')
      expect(restaurant).not_to be_valid
    end

    it "can have many menus" do
      restaurant = described_class.create(name: "Test Restaurant")
      menu1 = restaurant.menus.create(name: "Lunch")
      menu2 = restaurant.menus.create(name: "Dinner")

      expect(restaurant.menus.count).to eq(2)
      expect(restaurant.menus).to include(menu1)
      expect(restaurant.menus).to include(menu2)
    end

    it "can access menu items through menus" do
      restaurant = described_class.create(name: "Test Restaurant")
      menu = restaurant.menus.create(name: "Lunch")
      menu_item = MenuItem.create(name: "Burger")
      menu.menu_entries.create(menu_item: menu_item, price: 10.0)

      restaurant.reload
      expect(restaurant.menu_items).to include(menu_item)
    end
  end

  describe 'associations' do
    it { is_expected.to have_many(:menus).dependent(:destroy) }

    it 'destroys associated menus when destroyed, but do not destroy menu items' do
      restaurant = create(:restaurant)
      menu = create(:menu, restaurant: restaurant)
      menu_item = create(:menu_item)
      create(:menu_entry, menu:, menu_item:, price: 1.99)

      expect { restaurant.destroy }.to change(MenuEntry, :count).by(-1)
      expect(Menu.count).to eq(0)
      expect(MenuItem.count).to eq(1)
    end
  end
end
