require 'rails_helper'

RSpec.describe MenuEntry, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:menu) }
    it { is_expected.to belong_to(:menu_item) }
  end

  describe "validations" do
    subject(:menu_entry) { FactoryBot.build(:menu_entry, menu:, menu_item:) }

    let(:restaurant) { create(:restaurant) }
    let(:menu) { create(:menu, restaurant: restaurant) }
    let(:menu_item) { create(:menu_item) }


    it { is_expected.to validate_presence_of(:price) }
    it { is_expected.to validate_numericality_of(:price).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_uniqueness_of(:menu_item_id).scoped_to(:menu_id) }

    context("when a menu_item has already been added to a menu") do
      before do
        create(:menu_entry, menu:, menu_item:)
      end

      it "validates uniqueness of menu_item scoped to menu" do
        expect(menu_entry).not_to be_valid
        expect(menu_entry.errors[:menu_item_id]).to include("has already been taken")
      end
    end

    it "is valid without a description" do
      menu_entry = create(
        :menu_entry,
        menu:,
        menu_item:,
        price: 9.99,
        category: "Main Course",
        dietary_restrictions: "Vegan, Vegetarian",
        ingredients: "Vegan Patty, Bread, Lettuce, Tomato"
      )
      expect(menu_entry).to be_valid
    end

    it "is valid without a category" do
      menu_entry = create(
        :menu_entry,
        menu:,
        menu_item:,
        description: "Delicious vegan burger",
        price: 9.99,
        dietary_restrictions: "Vegan",
        ingredients: "Vegan Patty"
      )
      expect(menu_entry).to be_valid
    end

    it "is valid without dietary_restrictions" do
      menu_entry = create(
        :menu_entry,
        menu:,
        menu_item:,
        description: "Delicious vegan burger",
        price: 9.99,
        category: "Main Course",
        ingredients: "Vegan Patty"
      )
      expect(menu_entry).to be_valid
    end

    it "is valid without ingredients" do
      menu_entry = create(
        :menu_entry,
        menu:,
        menu_item:,
        description: "Delicious vegan burger",
        price: 9.99,
        category: "Main Course",
        dietary_restrictions: "Vegan",
      )
      expect(menu_entry).to be_valid
    end

    it "is not valid without a price" do
      menu_entry = described_class.new(description: "Delicious burger")
      expect(menu_entry).not_to be_valid
    end

    it "is not valid with a negative price" do
      menu_entry = described_class.new(price: -5.00, description: "Delicious burger")
      expect(menu_entry).not_to be_valid
    end
  end
end
