require 'rails_helper'

RSpec.describe Menu, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }

    it 'is valid with valid attributes' do
      menu = described_class.new(name: 'Breakfast Menu')
      expect(menu).to be_valid
    end

    it 'is invalid without a name' do
      menu = described_class.new(name: nil)
      expect(menu).not_to be_valid
    end
  end
end
