class Api::V1::MenuItemsController < ApplicationController
  before_action :set_menu_item, only: %i[ show update destroy ]

  # GET /menu_items
  # GET /menu_items.json
  def index
    @menu_items = MenuItem.all
    render json: @menu_items
  end

  # GET /menu_items/1
  # GET /menu_items/1.json
  def show
    render json: @menu_item
  end

  # POST /menu_items
  # POST /menu_items.json
  def create
    @menu_item = MenuItem.new(menu_item_params)

    if @menu_item.save
      render json: @menu_item, status: :created
    else
      render json: { errors: @menu_item.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /menu_items/1
  # PATCH/PUT /menu_items/1.json
  def update
    if @menu_item.update(menu_item_params)
      render json: @menu_item, status: :ok
    else
      render json: { errors: @menu_item.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /menu_items/1
  # DELETE /menu_items/1.json
  def destroy
    @menu_item.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_menu_item
      @menu_item = MenuItem.find(params.expect(:id))
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
