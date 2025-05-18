class RestaurantBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :address, :phone, :website, :description

  association :menus, blueprint: MenuBlueprint
end
