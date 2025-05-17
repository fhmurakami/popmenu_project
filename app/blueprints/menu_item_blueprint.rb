class MenuItemBlueprint < Blueprinter::Base
  identifier :id

  field :name

  field :price do |menu_item, options|
    entry = options[:menu_entry] || options.dig(:menu_entries, menu_item.id)
    entry&.price&.to_s
  end

    field :description do |menu_item, options|
      entry = options[:menu_entry] || options.dig(:menu_entries, menu_item.id)
      entry&.description
    end

  field :category do |menu_item, options|
    entry = options[:menu_entry] || options.dig(:menu_entries, menu_item.id)
    entry&.category
  end

  field :dietary_restrictions do |menu_item, options|
    entry = options[:menu_entry] || options.dig(:menu_entries, menu_item.id)
    entry&.dietary_restrictions
  end

  field :ingredients do |menu_item, options|
    entry = options[:menu_entry] || options.dig(:menu_entries, menu_item.id)
    entry&.ingredients
  end
end
