require "rails_helper"

RSpec.describe MenuItem, type: :model do
  describe "validations" do
    subject { FactoryBot.build(:menu_item, menu_id: menu.id) }

    let(:restaurant) { FactoryBot.create(:restaurant) }
    let(:menu) { FactoryBot.create(:menu, restaurant: restaurant) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:price) }

    it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
    it { is_expected.to validate_numericality_of(:price).is_greater_than_or_equal_to(0) }

    it "is valid with valid attributes" do
      menu_item = create(:menu_item, menu_id: menu.id)
      expect(menu_item).to be_valid
    end

    it "is valid without a description" do
      menu_item = create(
        :menu_item,
        menu_id: menu.id,
        name: "Vegan Burger",
        price: 9.99,
        category: "Main Course",
        dietary_restrictions: "Vegan, Vegetarian",
        ingredients: "Vegan Patty, Bread, Lettuce, Tomato"
      )
      expect(menu_item).to be_valid
    end

    it "is valid without a category" do
      menu_item = create(
        :menu_item,
        menu_id: menu.id,
        name: "Vegan Burger",
        description: "Delicious vegan burger",
        price: 9.99,
        dietary_restrictions: "Vegan",
        ingredients: "Vegan Patty"
      )
      expect(menu_item).to be_valid
    end

    it "is valid without dietary_restrictions" do
      menu_item = create(
        :menu_item,
        menu_id: menu.id,
        name: "Vegan Burger",
        description: "Delicious vegan burger",
        price: 9.99,
        category: "Main Course",
        ingredients: "Vegan Patty"
      )
      expect(menu_item).to be_valid
    end

    it "is valid without ingredients" do
      menu_item = create(
        :menu_item,
        menu_id: menu.id,
        name: "Vegan Burger",
        description: "Delicious vegan burger",
        price: 9.99,
        category: "Main Course",
        dietary_restrictions: "Vegan",
      )
      expect(menu_item).to be_valid
    end

    it "is not valid without a name" do
      menu_item = described_class.new(price: 9.99, description: "Delicious burger")
      expect(menu_item).not_to be_valid
    end

    it "is not valid without a price" do
      menu_item = described_class.new(name: "Burger", description: "Delicious burger")
      expect(menu_item).not_to be_valid
    end

    it "is not valid with a negative price" do
      menu_item = described_class.new(name: "Burger", price: -5.00, description: "Delicious burger")
      expect(menu_item).not_to be_valid
    end
  end

  describe "associations" do
    it { is_expected.to have_many(:menu_entries).dependent(:destroy) }
    it { is_expected.to have_many(:menus).through(:menu_entries) }

    it "is valid with a menu" do
      menu = create(:menu, restaurant: create(:restaurant))
      menu_item = create(:menu_item, menu_id: menu.id)
      create(:menu_entry, menu_id: menu.id, menu_item_id: menu_item.id)
      expect(menu_item.menus).to eq([ menu ])
    end

    it "is not valid without a menu" do
      menu_item = build(:menu_item)
      expect { menu_item.save! }.to raise_error(ActiveRecord::NotNullViolation)
    end

    it "allows menu items to be destroyed independently of the menu" do
      menu = create(:menu, name: "Dinner Menu", restaurant: create(:restaurant))
      menu_item = create(:menu_item, menu_id: menu.id, name: "Steak", price: 15.99)
      entry = create(:menu_entry, menu: menu, menu_item: menu_item)

      expect { menu_item.destroy }.to change(described_class, :count).by(-1)
      expect(MenuEntry.exists?(entry.id)).to be false
      expect(Menu.exists?(menu.id)).to be true
    end
  end
end
