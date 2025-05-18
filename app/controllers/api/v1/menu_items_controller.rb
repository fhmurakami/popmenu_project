class Api::V1::MenuItemsController < ApplicationController
  before_action :set_menu_item, only: %i[ show update destroy ]

  # GET /menu_items
  # GET /menu_items.json
  def index
    @menu_items = MenuItem.all
    menu_entries = MenuEntry.where(
      menu_item_id: @menu_items.map(&:id),
      menu_id: params[:menu_id]
    ).index_by(&:menu_item_id)

    render json: MenuItemBlueprint.render(@menu_items, menu_entries:)
  end

  # GET /menu_items/1
  # GET /menu_items/1.json
  def show
    if @menu_item
      render json: MenuItemBlueprint.render(
        @menu_item,
        menu_entries: @menu_item.menu_entries
          .where(menu_id: params[:menu_id])
          .index_by(&:menu_item_id)
      )
    else
      render json: { errors: "Menu item not found" }, status: :not_found
    end
  end

  # POST /menu_items
  # POST /menu_items.json
  def create
    # @menu_item = MenuItem.new(menu_item_params)
    @menu_item = MenuItem.find_or_create_by(name: menu_item_params[:name])

    if @menu_item.persisted?
      entry_params = menu_item_params.except(:name)

      @menu_entry = MenuEntry.new(
        entry_params.merge(menu_item_id: @menu_item.id)
      )

      if @menu_entry.save
        render json: MenuItemBlueprint.render(@menu_item, menu_entry: @menu_entry), status: :created
      else
        render json: { errors: @menu_entry.errors }, status: :unprocessable_entity
      end
    else
      render json: { errors: @menu_item.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /menu_items/1
  # PATCH/PUT /menu_items/1.json
  def update
    if @menu_item
      if @menu_item.update(name: menu_item_params[:name])
        @menu_entry = MenuEntry.find_or_create_by(
          menu_item_id: @menu_item.id,
          menu_id: menu_item_params[:menu_id]
        )

        if @menu_entry.update(menu_item_params.except(:name))
          render json: MenuItemBlueprint.render(@menu_item, menu_entry: @menu_entry), status: :ok
        else
          render json: { errors: @menu_entry.errors }, status: :unprocessable_entity
        end
      else
        render json: { errors: @menu_item.errors }, status: :unprocessable_entity
      end
    else
      render json: { errors: "Menu item not found" }, status: :not_found
    end
  end

  # DELETE /menu_items/1
  # DELETE /menu_items/1.json
  def destroy
    if @menu_item
      if @menu_item.destroy
        render json: { message: "Item deleted successfully" }, status: :ok
      else
        render json: { errors: @menu_item.errors }, status: :unprocessable_entity
      end
    else
      render json: { errors: "Menu item not found" }, status: :not_found
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_menu_item
      @menu_item = MenuItem.find_by(id: params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def menu_item_params
      params.expect(
        menu_item: [
          :name,
          :description,
          :price,
          :category,
          :dietary_restrictions,
          :ingredients,
          :menu_id
        ]
      )
    end
end
