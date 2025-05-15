class Api::V1::MenusController < ApplicationController
  before_action :set_menu, only: %i[ show update destroy ]

  # GET /menus or /menus.json
  def index
    @menus = Menu.all
    render json: @menus, include: :menu_items
  end

  # GET /menus/1 or /menus/1.json
  def show
    render json: @menu, include: :menu_items
  end

  def new
    @menu = Menu.new
    render json: @menu
  end

  # POST /menus or /menus.json
  def create
    @menu = Menu.new(menu_params)

    if @menu.save
      render json: @menu, include: :menu_items, status: :created
    else
      render json: { errors: @menu.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /menus/1 or /menus/1.json
  def update
    if @menu.update(menu_params)
      render json: @menu, include: :menu_items, status: :ok
    else
      render json: { errors: @menu.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /menus/1 or /menus/1.json
  def destroy
    if @menu.destroy
      render json: { message: "Menu deleted successfully" }, status: :ok
    else
      render json: { errors: @menu.errors }, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_menu
      @menu = Menu.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def menu_params
      restaurant_id, menu_data = params.expect(:restaurant_id, menu: [ :name ])
      menu_data.merge(restaurant_id: restaurant_id)
    end
end
