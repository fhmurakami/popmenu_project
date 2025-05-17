class Restaurant < ApplicationRecord
  has_many :menus, dependent: :destroy
  has_many :menu_entries, through: :menus
  has_many :menu_items, through: :menu_entries

  validates :name, presence: true, uniqueness: true
end
