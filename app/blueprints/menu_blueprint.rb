class MenuBlueprint < Blueprinter::Base
  identifier :id

  field :name

  field :menu_items do |menu, options|
    menu.menu_entries.includes(:menu_item).map do |entry|
      MenuItemBlueprint.render_as_hash(entry.menu_item, menu_entry: entry)
    end
  end
end
