class Api::V1::MenusController < ApplicationController
  before_action :set_menu, only: %i[ show update destroy ]

  # GET /menus or /menus.json
  def index
    @menus = Menu.all
    render json: @menus.to_json(include: :menu_items)
  end

  # GET /menus/1 or /menus/1.json
  def show
    render json: @menu.to_json(include: :menu_items)
  end

  # POST /menus or /menus.json
  def create
    @menu = Menu.new(menu_params)

    if @menu.save
      render json: @menu.to_json(include: :menu_items), status: :created
    else
      render json: { errors: @menu.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /menus/1 or /menus/1.json
  def update
    if @menu.update(menu_params)
      render json: @menu.to_json(include: :menu_items), status: :ok
    else
      render json: { errors: @menu.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /menus/1 or /menus/1.json
  def destroy
    @menu.destroy!

    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_menu
      @menu = Menu.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def menu_params
      params.expect(menu: [ :name ])
    end
end
