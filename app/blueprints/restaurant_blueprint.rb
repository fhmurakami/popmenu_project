class RestaurantBlueprint < Blueprinter::Base
  identifier :id

  field :name

  association :menus, blueprint: MenuBlueprint
end
