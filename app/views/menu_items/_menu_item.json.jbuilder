json.extract! menu_item, :id, :name, :description, :price, :category, :dietary_restrictions, :ingredients, :created_at, :updated_at
json.url menu_item_url(menu_item, format: :json)
