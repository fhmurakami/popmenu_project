require "rails_helper"

RSpec.describe Menu, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }

    it "is valid with valid attributes" do
      menu = described_class.new(name: "Breakfast Menu")
      expect(menu).to be_valid
    end

    it "is invalid without a name" do
      menu = described_class.new(name: nil)
      expect(menu).not_to be_valid
    end
  end

  describe "associations" do
    it { is_expected.to have_many(:menu_items).dependent(:destroy) }

    it "destroys associated menu items when the menu is destroyed" do
      menu = described_class.create(name: "Lunch Menu")
      menu.menu_items.create(name: "Salad", price: 5.99)

      expect { menu.destroy }.to change(MenuItem, :count).by(-1)
    end
  end
end
