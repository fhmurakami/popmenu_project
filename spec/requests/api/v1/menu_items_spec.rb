require "rails_helper"

RSpec.describe "/menu_items", type: :request do
  # This should return the minimal set of attributes required to create a valid
  # MenuItem. As you add validations to MenuItem, be sure to
  # adjust the attributes here as well.
  let(:restaurant) { create(:restaurant) }
  let(:menu) { create(:menu, restaurant:) }
  let(:valid_attributes) {
    {
      menu_id: menu.id,
      name: "Cheese Burger",
      description: "Delicious cheese burger",
      price: 9.99,
      category: "Main Course",
      dietary_restrictions: "None",
      ingredients: "Beef, Bread, Cheese, Lettuce, Tomato"
    }
  }

  let(:invalid_attributes) {
    {
      name: nil
    }
  }

  # This should return the minimal set of values that should be in the headers
  # in order to pass any filters (e.g. authentication) defined in
  # MenuItemsController, or in your router and rack
  # middleware. Be sure to keep this updated too.
  let(:valid_headers) {
    {}
  }

  describe "GET /index" do
    context "when no menu item exist" do
      it "returns an empty array" do
        get api_v1_restaurant_menu_items_url(restaurant, menu), headers: valid_headers, as: :json
        expect(response).to be_successful
        expect(JSON.parse(response.body)).to be_empty
      end
    end

    context "when menu items exist" do
      it "renders a successful response" do
        menu = create(:menu_with_items, menu_items_count: 3, restaurant:)
        menu_entries = menu.menu_entries

        get api_v1_restaurant_menu_items_url(restaurant, menu), headers: valid_headers, as: :json

        parsed_response = JSON.parse(response.body)

        expect(response).to be_successful
        expect(parsed_response.size).to eq(3)
        expect(parsed_response.first["name"]).to eq("Menu Item 1")
        expect(parsed_response.last["name"]).to eq("Menu Item 3")
        expect(parsed_response.first["price"]).to eq(menu_entries.first.price.to_s)
      end
    end
  end

  describe "GET /show" do
    context "when the menu item does not exist" do
      it "returns a not found response (404)" do
        get api_v1_restaurant_menu_item_url(restaurant, menu, id: 999), as: :json
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when menu exists" do
      it "returns a successful response" do
        menu_item = create(:menu_item)

        get api_v1_restaurant_menu_item_url(restaurant, menu, menu_item), as: :json

        expect(response).to be_successful
      end

      it "returns the menu item" do
        menu_item = create(:menu_item)

        get api_v1_restaurant_menu_item_url(restaurant, menu, menu_item), as: :json

        json = JSON.parse(response.body)

        expect(json["id"]).to eq(menu_item.id)
        expect(json["name"]).to eq(menu_item.name)
      end
    end
  end

  describe "POST /create" do
    context "with valid parameters" do
      it "creates a new MenuItem" do
        expect {
          post api_v1_restaurant_menu_items_url(restaurant, menu),
               params: { menu_item: valid_attributes },
               headers: valid_headers,
               as: :json
        }.to change(MenuItem, :count).by(1)
      end

      it "renders a JSON response with the new menu_item" do
        post api_v1_restaurant_menu_items_url(restaurant, menu),
             params: { menu_item: valid_attributes }, headers: valid_headers, as: :json
        expect(response).to have_http_status(:created)
        expect(response.content_type).to match(a_string_including("application/json"))
      end

      context "with valid menu entry parameters" do
        it "creates a new MenuEntry" do
          expect {
          post api_v1_restaurant_menu_items_url(restaurant, menu),
               params: { menu_item: valid_attributes },
               headers: valid_headers,
               as: :json
        }.to change(MenuEntry, :count).by(1)
        end

        it "renders a JSON response with the new menu_item and menu_entry" do
          post api_v1_restaurant_menu_items_url(restaurant, menu),
               params: { menu_item: valid_attributes }, headers: valid_headers, as: :json
          expect(response).to have_http_status(:created)
          expect(response.content_type).to match(a_string_including("application/json"))
          expect(response.body).to include('"name":"Cheese Burger"')
          expect(response.body).to include('"price":"9.99"')
          expect(response.body).to include('"description":"Delicious cheese burger"')
          expect(response.body).to include('"category":"Main Course"')
          expect(response.body).to include('"dietary_restrictions":"None"')
          expect(response.body).to include('"ingredients":"Beef, Bread, Cheese, Lettuce, Tomato"')
        end
      end

      context "with invalid menu entry parameters" do
        it "does not create a new MenuEntry" do
          expect {
            post api_v1_restaurant_menu_items_url(restaurant, menu),
              params: { menu_item: invalid_attributes }, as: :json
          }.not_to change(MenuEntry, :count)
        end

        it "renders a JSON response with errors for the new menu_entry" do
          post api_v1_restaurant_menu_items_url(restaurant, menu),
            params: { menu_item: invalid_attributes }, headers: valid_headers, as: :json
          expect(response).to have_http_status(:unprocessable_entity)
          expect(response.content_type).to match(a_string_including("application/json"))
        end

        it "returns error messages" do
          post api_v1_restaurant_menu_items_url(restaurant, menu),
            params: { menu_item: { name: "Pizza" } },
            headers: valid_headers, as: :json

          errors = JSON.parse(response.body)["errors"]

          expect(errors).not_to be_empty
          expect(errors).to have_key("menu")
          expect(errors["menu"]).to include("must exist")
          expect(errors).to have_key("price")
          expect(errors["price"]).to include("can't be blank")
          expect(errors).to have_key("price")
          expect(errors["price"]).to include("is not a number")
        end
      end
    end

    context "with invalid parameters" do
      it "does not create a new MenuItem" do
        expect {
          post api_v1_restaurant_menu_items_url(restaurant, menu),
               params: { menu_item: invalid_attributes }, as: :json
        }.not_to change(MenuItem, :count)
      end

      it "renders a JSON response with errors for the new menu_item" do
        post api_v1_restaurant_menu_items_url(restaurant, menu),
             params: { menu_item: invalid_attributes }, headers: valid_headers, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(a_string_including("application/json"))
      end

      it "returns error messages" do
        post api_v1_restaurant_menu_items_url(restaurant, menu),
             params: { menu_item: invalid_attributes }, headers: valid_headers, as: :json

        errors = JSON.parse(response.body)["errors"]

        expect(errors).not_to be_empty
        expect(errors).to have_key("name")
        expect(errors["name"]).to include("can't be blank")
      end
    end
  end

  describe "PATCH /update" do
    context "when menu item does not exist" do
      it "returns a 404" do
        patch api_v1_restaurant_menu_item_url(restaurant, menu, 0)
        expect(response).to have_http_status(:not_found)
      end
    end

    context "with valid parameters" do
      let(:new_menu) { create(:menu, restaurant:) }
      let(:new_attributes) {
        {
          menu_id: menu.id,
          name: "Updated Menu Item",
          price: 12.99,
          description: "Updated description",
          category: "Updated Category",
          dietary_restrictions: "Updated Dietary Restrictions",
          ingredients: "Updated Beef, Updated Bread, Updated Cheese"
        }
      }

      it "updates the requested menu_item and menu_entry" do
        menu_item = create(:menu_item)
        menu_entry = create(:menu_entry, menu_item:, menu:)

        patch api_v1_restaurant_menu_item_url(restaurant, menu, menu_item),
              params: { menu_item: new_attributes },
              headers: valid_headers,
              as: :json
        menu_item.reload
        menu_entry.reload

        expect(menu_item.name).to eq("Updated Menu Item")
        expect(menu_entry.menu_id).to eq(menu.id)
        expect(menu_entry.price).to eq(12.99)
        expect(menu_entry.description).to eq("Updated description")
        expect(menu_entry.category).to eq("Updated Category")
        expect(menu_entry.dietary_restrictions).to eq("Updated Dietary Restrictions")
        expect(menu_entry.ingredients).to eq("Updated Beef, Updated Bread, Updated Cheese")
      end

      context "when menu_id is updated" do
        it "updates the requested menu_item and creates a new menu entry" do
          menu_item = create(:menu_item)
          create(:menu_entry, menu_item:, menu:)

          patch api_v1_restaurant_menu_item_url(restaurant, menu, menu_item),
                params: {
                  menu_item: new_attributes.merge(menu_id: new_menu.id)
                },
                headers: valid_headers,
                as: :json
          menu_item.reload
          menu_entry = MenuEntry.where(menu_item_id: menu_item.id).last

          expect(menu_item.name).to eq("Updated Menu Item")
          expect(menu_entry.menu_id).to eq(new_menu.id)
          expect(menu_entry.price).to eq(12.99)
          expect(menu_entry.description).to eq("Updated description")
          expect(menu_entry.category).to eq("Updated Category")
          expect(menu_entry.dietary_restrictions).to eq("Updated Dietary Restrictions")
          expect(menu_entry.ingredients).to eq("Updated Beef, Updated Bread, Updated Cheese")
        end
      end

      it "renders a JSON response with the menu_item" do
        menu_item = create(:menu_item)
        create(:menu_entry, menu_item:, menu:, **valid_attributes.except(:name))

        patch api_v1_restaurant_menu_item_url(restaurant, menu, menu_item),
              params: { menu_item: new_attributes }, headers: valid_headers, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to match(a_string_including("application/json"))
      end

      it "updates the menu_entry from the correct menu" do
        menu_item = create(:menu_item, name: valid_attributes[:name])
        menu_entry = create(
          :menu_entry,
          menu:,
          menu_item:,
          **valid_attributes.except(:name)
        )
        another_menu_entry = create(
          :menu_entry,
          menu: new_menu,
          menu_item: menu_item,
          **valid_attributes.except(:name, :menu_id)
        )

        patch api_v1_restaurant_menu_item_url(restaurant, menu, menu_item),
              params: { menu_item: new_attributes }, headers: valid_headers, as: :json

        menu_item.reload
        menu_entry.reload
        another_menu_entry.reload

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to match(a_string_including("application/json"))

        expect(menu_item.name).to eq("Updated Menu Item")

        expect(menu_entry.price).to eq(12.99)
        expect(menu_entry.menu_id).to eq(menu.id)
        expect(menu_entry.description).to eq("Updated description")
        expect(menu_entry.category).to eq("Updated Category")
        expect(menu_entry.dietary_restrictions).to eq("Updated Dietary Restrictions")
        expect(menu_entry.ingredients).to eq("Updated Beef, Updated Bread, Updated Cheese")

        expect(another_menu_entry.price).to eq(9.99)
        expect(another_menu_entry.menu_id).to eq(new_menu.id)
        expect(another_menu_entry.description).to eq("Delicious cheese burger")
        expect(another_menu_entry.category).to eq("Main Course")
        expect(another_menu_entry.dietary_restrictions).to eq("None")
        expect(another_menu_entry.ingredients).to eq("Beef, Bread, Cheese, Lettuce, Tomato")
      end
    end

    context "with invalid parameters" do
      it "renders a JSON response with errors for the menu_item" do
        menu_item = create(:menu_item, name: valid_attributes[:name])
        patch api_v1_restaurant_menu_item_url(restaurant, menu, menu_item),
              params: { menu_item: invalid_attributes }, headers: valid_headers, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end
  end

  describe "DELETE /destroy" do
    context "when the menu item does not exist" do
      it "returns a 404" do
        delete api_v1_restaurant_menu_item_url(restaurant, menu, 0)
        expect(response).to have_http_status(:not_found)
      end
    end

    it "destroys the requested menu_item" do
      menu_item = create(:menu_item)
      expect {
        delete api_v1_restaurant_menu_item_url(restaurant, menu, menu_item), headers: valid_headers, as: :json
      }.to change(MenuItem, :count).by(-1)
      expect(MenuItem.find_by(id: menu_item.id)).to be_nil
    end
  end
end
