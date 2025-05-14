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
      menu_item = MenuItem.create(name: "Burger", price: 10.0, menu_id: menu.id)
      menu.menu_entries.create(menu_item: menu_item, price: menu_item.price)

      restaurant.reload
      expect(restaurant.menu_items).to include(menu_item)
    end
  end

  describe 'associations' do
    it { is_expected.to have_many(:menus).dependent(:destroy) }

    it 'destroys associated menus and menu_items when destroyed' do
      restaurant = create(:restaurant)
      menu = create(:menu, restaurant: restaurant)
      create(:menu_item, menu_id: menu.id)

      expect { restaurant.destroy }.to change(MenuItem, :count).by(-1)
    end
  end
end
