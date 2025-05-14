require "rails_helper"

RSpec.describe Menu, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }

    it "is valid with valid attributes" do
      restaurant = create(:restaurant)
      menu = described_class.new(name: "Breakfast Menu", restaurant: restaurant)
      expect(menu).to be_valid
    end

    it "is invalid without a name" do
      menu = described_class.new(name: nil)
      expect(menu).not_to be_valid
    end
  end

  describe "associations" do
    it { is_expected.to belong_to(:restaurant) }
    it { is_expected.to have_many(:menu_entries).dependent(:destroy) }
    it { is_expected.to have_many(:menu_items).through(:menu_entries) }

    it "destroys associated menu entries when the menu is destroyed" do
      restaurant = create(:restaurant)
      menu = described_class.create(name: "Lunch Menu", restaurant: restaurant)
      menu_item = create(:menu_item, menu_id: menu.id, name: "Salad", price: 5.99)
      entry = create(:menu_entry, menu: menu, menu_item: menu_item)

      expect { menu.destroy }.to change(MenuEntry, :count).by(-1)
      expect(MenuEntry.exists?(entry.id)).to be false
    end
  end
end
