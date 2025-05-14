require 'rails_helper'

RSpec.describe "/restaurants", type: :request do
  describe "GET /index" do
    it "renders a successful response" do
      Restaurant.create(name: "Test Restaurant")
      get api_v1_restaurants_url, as: :json
      expect(response).to be_successful
    end
  end

  describe "GET /show" do
    it "renders a successful response" do
      restaurant = Restaurant.create(name: "Test Restaurant")
      get api_v1_restaurant_url(restaurant), as: :json
      expect(response).to be_successful
    end
  end

  describe "POST /create" do
    context "with valid parameters" do
      it "creates a new Restaurant" do
        expect {
          post api_v1_restaurants_url,
               params: { restaurant: { name: "New Restaurant" } }, as: :json
        }.to change(Restaurant, :count).by(1)
      end

      it "renders a JSON response with the new restaurant" do
        post api_v1_restaurants_url,
             params: { restaurant: { name: "New Restaurant" } }, as: :json
        expect(response).to have_http_status(:created)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end

    context "with invalid parameters" do
      it "does not create a new Restaurant" do
        expect {
          post api_v1_restaurants_url,
               params: { restaurant: { name: nil } }, as: :json
        }.not_to change(Restaurant, :count)
      end

      it "renders a JSON response with errors for the new restaurant" do
        post api_v1_restaurants_url,
             params: { restaurant: { name: nil } }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end
  end

  describe "PATCH /update" do
    context "with valid parameters" do
      it "updates the requested restaurant" do
        restaurant = Restaurant.create(name: "Test Restaurant")
        patch api_v1_restaurant_url(restaurant),
              params: { restaurant: { name: "Updated Restaurant" } }, as: :json
        restaurant.reload
        expect(restaurant.name).to eq("Updated Restaurant")
      end

      it "renders a JSON response with the restaurant" do
        restaurant = Restaurant.create(name: "Test Restaurant")
        patch api_v1_restaurant_url(restaurant),
              params: { restaurant: { name: "Updated Restaurant" } }, as: :json
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end

    context "with invalid parameters" do
      it "renders a JSON response with errors for the restaurant" do
        restaurant = Restaurant.create(name: "Test Restaurant")
        patch api_v1_restaurant_url(restaurant),
              params: { restaurant: { name: nil } }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end
  end

  describe "DELETE /destroy" do
    it "destroys the requested restaurant" do
      restaurant = Restaurant.create(name: "Test Restaurant")
      expect {
        delete api_v1_restaurant_url(restaurant), as: :json
      }.to change(Restaurant, :count).by(-1)
    end
  end
end
