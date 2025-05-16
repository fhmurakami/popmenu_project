class MenuItem < ApplicationRecord
  has_many :menu_entries, dependent: :destroy
  has_many :menus, through: :menu_entries
  has_many :restaurants, through: :menus

  validates :name, presence: true, uniqueness: { case_sensitive: false }
end
