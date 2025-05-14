class Api::V1::RestaurantsController < ApplicationController
  before_action :set_restaurant, only: %i[ show update destroy ]

  # GET /restaurants
  # GET /restaurants.json
  def index
    @restaurants = Restaurant.all
    render json: @restaurants.to_json(include: :menus)
  end

  # GET /restaurants/1
  # GET /restaurants/1.json
  def show
    render json: @restaurant.to_json(include: :menus)
  end

  # POST /restaurants
  # POST /restaurants.json
  def create
    @restaurant = Restaurant.new(restaurant_params)

    if @restaurant.save
      render json: @restaurant.to_json(include: :menus), status: :created
    else
      render json: { errors: @restaurant.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /restaurants/1
  # PATCH/PUT /restaurants/1.json
  def update
    if @restaurant.update(restaurant_params)
      render json: @restaurant.to_json(include: :menus), status: :ok
    else
      render json: { errors: @restaurant.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /restaurants/1
  # DELETE /restaurants/1.json
  def destroy
    if @restaurant.destroy
      render json: { message: "Restaurant deleted successfully" }, status: :ok
    else
      render json: { errors: @restaurant.errors }, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_restaurant
      @restaurant = Restaurant.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def restaurant_params
      params.expect(restaurant: [ :name, :address, :phone, :website, :description ])
    end
end
