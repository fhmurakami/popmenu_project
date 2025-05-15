require "rails_helper"

RSpec.describe "/menus", type: :request do
  # This should return the minimal set of attributes required to create a valid
  # Menu. As you add validations to Menu, be sure to
  # adjust the attributes here as well.
  let(:restaurant) { create(:restaurant) }
  let(:valid_attributes) {
    {
      name: "Breakfast Menu",
      restaurant:
    }
  }

  let(:invalid_attributes) {
    { name: nil }
  }

  describe "GET /index" do
    context "when no menus exist" do
      it "returns an empty array" do
        # Arrange & Act
        get api_v1_restaurant_menus_url(restaurant)
        # Assert
        expect(response).to be_successful
        expect(JSON.parse(response.body)).to be_empty
      end
    end

    context "when menus exist" do
      it "renders a successful response" do
        # Arrange
        create_list(:menu, 3, restaurant: restaurant)
        # Act
        get api_v1_restaurant_menus_url(restaurant)
        # Assert
        expect(response).to be_successful
        expect(JSON.parse(response.body).size).to eq(3)
      end

      context "with menu items" do
        it "renders a successful response with menu items" do
          # Arrange
          menu = create(
            :menu_with_items,
            menu_items_count: 3,
            restaurant: restaurant
          )
          # Act
          get api_v1_restaurant_menus_url(restaurant)
          # Assert
          parsed_menu_list = JSON.parse(response.body)
          parsed_menu_items = parsed_menu_list.first["menu_items"]

          expect(response).to be_successful
          expect(parsed_menu_list.size).to eq(1)
          expect(parsed_menu_items.size).to eq(3)
          expect(parsed_menu_items.last["name"]).to eq(menu.menu_items.last.name)
          expect(parsed_menu_items.last["price"]).to eq(menu.menu_items.last.price.to_s)
          expect(parsed_menu_items.last["menu_id"]).to eq(menu.id)
        end
      end
    end
  end

  describe "GET /show" do
    context "when menu does not exist" do
      it "returns not found (404)" do
        # Arrange & Act
        get api_v1_restaurant_menu_url(restaurant, 0)
        # Assert
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when menu exists" do
      it "returns the menu" do
        # Arrange
        menu = create(:menu, restaurant:)
        # Act
        get api_v1_restaurant_menu_url(restaurant, menu)
        # Assert
        expect(response).to be_successful

        parsed_menu = JSON.parse(response.body)
        expect(parsed_menu["id"]).to eq(menu.id)
        expect(parsed_menu["name"]).to eq(menu.name)
      end

      context "with menu items" do
        it "renders a successful response with menu items" do
          # Arrange
          menu = create(:menu_with_items, menu_items_count: 3, restaurant:)
          # Act
          get api_v1_restaurant_menu_url(restaurant, menu)
          # Assert
          parsed_menu = JSON.parse(response.body)

          parsed_menu_items = parsed_menu["menu_items"]

          expect(response).to be_successful
          expect(parsed_menu).to be_an_instance_of(Hash)
          expect(parsed_menu_items.size).to eq(3)
          expect(parsed_menu_items.last["name"]).to eq(menu.menu_items.last.name)
          expect(parsed_menu_items.last["price"]).to eq(menu.menu_items.last.price.to_s)
          expect(parsed_menu_items.last["menu_id"]).to eq(menu.id)
        end
      end
    end
  end

  describe "POST /create" do
    context "with valid parameters" do
      it "creates a new Menu" do
        # Arrange, Act & Assert
        expect {
          post api_v1_restaurant_menus_url(restaurant), params: { menu: valid_attributes }
        }.to change(Menu, :count).by(1)
      end

      it "returns created (201) status" do
        # Arrange & Act
        post api_v1_restaurant_menus_url(restaurant), params: { menu: valid_attributes }
        # Assert
        expect(response).to have_http_status(:created)
      end
    end

    context "with invalid parameters" do
      it "does not create a new Menu" do
        # Arrange, Act & Assert
        expect {
          post api_v1_restaurant_menus_url(restaurant), params: { menu: invalid_attributes }
        }.not_to change(Menu, :count)
      end

      it "returns a response with unprocessable entity (422) status" do
        # Arrange & Act
        post api_v1_restaurant_menus_url(restaurant), params: { menu: invalid_attributes }
        # Assert
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns error messages" do
        # Arrange & Act
        post api_v1_restaurant_menus_url(restaurant), params: { menu: invalid_attributes }

        errors = JSON.parse(response.body)["errors"]

        # Assert
        expect(errors).not_to be_empty
        expect(errors).to have_key("name")
        expect(errors["name"]).to include("can't be blank")
      end
    end
  end

  describe "PATCH /update" do
    context "with valid parameters" do
      let(:new_attributes) {
        { name: "Updated Menu" }
      }

      it "updates the requested menu" do
        # Arrange
        menu = create(:menu, valid_attributes)
        # Act
        patch api_v1_restaurant_menu_url(restaurant, menu), params: { menu: new_attributes }
        menu.reload
        # Assert
        expect(menu.name).to eq("Updated Menu")
      end

      it "returns ok (200) status code" do
        # Arrange
        menu = create(:menu, valid_attributes)
        # Act
        patch api_v1_restaurant_menu_url(restaurant, menu), params: { menu: new_attributes }
        # Assert
        expect(response).to have_http_status(:ok)
      end

      context "when the menu has associated menu items" do
        it "maintains the associated menu items" do
          # Arrange
          menu = create(:menu_with_items, menu_items_count: 3, **valid_attributes)
          menu_items = menu.menu_items

          # Act
          patch api_v1_restaurant_menu_url(restaurant, menu), params: {
            menu: new_attributes
          }
          menu.reload

          # Assert
          expect(menu.name).to eq("Updated Menu")
          expect(menu.menu_items.count).to eq(3)
          expect(menu.menu_items.pluck(:id)).to match_array(menu_items.pluck(:id))
        end
      end
    end

    context "with invalid parameters" do
      let(:invalid_attributes) { { name: "" } }

      it "does not update the requested menu" do
        # Arrange
        menu = create(:menu, valid_attributes)
        original_name = menu.name
        # Act
        patch api_v1_restaurant_menu_url(restaurant, menu), params: { menu: invalid_attributes }
        menu.reload
        # Assert
        expect(menu.name).not_to eq("")
        expect(menu.name).to eq(original_name)
      end

      it "returns unprocessable_entity (422) status code" do
        # Arrange
        menu = create(:menu, valid_attributes)
        # Act
        patch api_v1_restaurant_menu_url(restaurant, menu), params: { menu: invalid_attributes }
        # Assert
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns error messages" do
        # Arrange
        menu = create(:menu, valid_attributes)
        # Act
        patch api_v1_restaurant_menu_url(restaurant, menu), params: { menu: invalid_attributes }

        errors = JSON.parse(response.body)["errors"]

        # Assert
        expect(errors).not_to be_empty
        expect(errors).to have_key("name")
        expect(errors["name"]).to include("can't be blank")
      end
    end
  end

  describe "DELETE /destroy" do
    it "destroys the requested menu" do
      # Arrange
      menu = create(:menu, valid_attributes)

      # Act
      expect {
        delete api_v1_restaurant_menu_url(restaurant, menu)
      }.to change(Menu, :count).by(-1)

      # Assert
      expect(Menu.find_by(id: menu.id)).to be_nil
    end
  end
end
