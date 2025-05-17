require "rails_helper"

RSpec.describe MenuItem, type: :model do
  describe "validations" do
    subject { FactoryBot.build(:menu_item) }

    let(:restaurant) { FactoryBot.create(:restaurant) }
    let(:menu) { FactoryBot.create(:menu, restaurant: restaurant) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
  end

  describe "associations" do
    it { is_expected.to have_many(:menu_entries).dependent(:destroy) }
    it { is_expected.to have_many(:menus).through(:menu_entries) }
    it { is_expected.to have_many(:restaurants).through(:menus) }

    it "allows menu items to be destroyed independently of the menu" do
      menu = create(:menu, name: "Dinner Menu", restaurant: create(:restaurant))
      menu_item = create(:menu_item)
      entry = create(:menu_entry, menu: menu, menu_item: menu_item)

      expect { menu_item.destroy }.to change(described_class, :count).by(-1)
      expect(MenuEntry.exists?(entry.id)).to be false
      expect(Menu.exists?(menu.id)).to be true
    end
  end
end
