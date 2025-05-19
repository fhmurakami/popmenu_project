require 'rails_helper'

RSpec.describe RestaurantImportService do
  let(:service) { described_class.new }

  describe '#import' do
    context 'with valid JSON data' do
      let(:valid_json) do
        {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: [
                {
                  name: "lunch",
                  menu_items: [
                    { name: "Burger", price: 9.0 },
                    { name: "Salad", price: 5.0 }
                  ]
                }
              ]
            }
          ]
        }.to_json
      end

      it 'creates new restaurants, menus, and menu items' do
        expect {
          result = service.import(valid_json)
          expect(result[:success]).to be true
        }.to change(Restaurant, :count).by(1)
          .and change(Menu, :count).by(1)
          .and change(MenuItem, :count).by(2)
          .and change(MenuEntry, :count).by(2)
      end

      it 'logs the creation of each entity' do
        result = service.import(valid_json)

        expect(result[:logs]).to include(
          hash_including(level: 'info', message: including('Restaurant: Test Restaurant'))
        )
        expect(result[:logs]).to include(
          hash_including(level: 'info', message: including('Menu: lunch'))
        )
        expect(result[:logs]).to include(
          hash_including(level: 'info', message: including('Menu item: Burger'))
        )
      end

      it 'handles duplicate menu items correctly' do
        # Create the first restaurant with menu and items
        service.import(valid_json)

        # Create a second restaurant with the same menu item names
        second_json = {
          restaurants: [
            {
              name: "Another Restaurant",
              menus: [
                {
                  name: "dinner",
                  menu_items: [
                    { name: "Burger", price: 12.0 }, # Same name, different price
                    { name: "Pasta", price: 10.0 }   # New item
                  ]
                }
              ]
            }
          ]
        }.to_json

        expect {
          result = service.import(second_json)
          expect(result[:success]).to be true
        }.to change(Restaurant, :count).by(1)
          .and change(Menu, :count).by(1)
          .and change(MenuItem, :count).by(1) # Only Pasta is new, Burger already exists
          .and change(MenuEntry, :count).by(2)

        # Check that we have only one MenuItem with name "Burger"
        expect(MenuItem.where(name: "Burger").count).to eq(1)

        # Check that we have two MenuEntry records for "Burger" with different prices
        burger = MenuItem.find_by(name: "Burger")
        burger_entries = MenuEntry.where(menu_item_id: burger.id)
        expect(burger_entries.count).to eq(2)

        # Verify prices are correct
        lunch_menu = Menu.find_by(name: "lunch")
        dinner_menu = Menu.find_by(name: "dinner")

        lunch_price = MenuEntry.find_by(menu_id: lunch_menu.id, menu_item_id: burger.id).price
        dinner_price = MenuEntry.find_by(menu_id: dinner_menu.id, menu_item_id: burger.id).price

        expect(lunch_price).to eq(9.0)
        expect(dinner_price).to eq(12.0)
      end

      it 'handles menu entry with same price' do
        # First import to create items
        service.import(valid_json)

        # Import the same data again to test when price is the same
        result = service.import(valid_json)

        expect(result[:success]).to be true
        expect(result[:logs]).to include(
          hash_including(level: 'info', message: including('Menu entry: Burger on lunch menu - price $9.0'))
        )
      end

      context 'with new menu items' do
        it 'logs creation of new menu items' do
          # Clear any existing entry in database to ensure we're working with a fresh database
          Restaurant.destroy_all
          Menu.destroy_all
          MenuEntry.destroy_all
          MenuItem.destroy_all


          # Import with a new menu item name
          json = {
            restaurants: [
              {
                name: "Test Restaurant",
                menus: [
                  {
                    name: "lunch",
                    menu_items: [
                      { name: "Brand New Item", price: 15.0 }
                    ]
                  }
                ]
              }
            ]
          }.to_json

          result = service.import(json)

          # Verify the log for menu item creation
          expect(result[:logs]).to include(
            hash_including(level: 'info', message: "Menu item: Brand New Item (Created)")
          )

          # Import another menu with another new item
          second_json = {
            restaurants: [
              {
                name: "Second Restaurant",
                menus: [
                  {
                    name: "dinner",
                    menu_items: [
                      { name: "Another New Item", price: 20.0 }
                    ]
                  }
                ]
              }
            ]
          }.to_json

          result = service.import(second_json)

          # Verify the log for the second menu item creation
          expect(result[:logs]).to include(
            hash_including(level: 'info', message: "Menu item: Another New Item (Created)")
          )
        end
      end
    end

    context 'with invalid JSON data' do
      it 'handles invalid JSON format' do
        result = service.import('{ invalid json }')

        expect(result[:success]).to be false
        expect(result[:logs].first[:level]).to eq('error')
        expect(result[:logs].first[:message]).to include('JSON parsing error')
      end

      it 'handles missing restaurants array' do
        result = service.import('{ "not_restaurants": [] }')

        expect(result[:success]).to be false
        expect(result[:logs].first[:level]).to eq('error')
        expect(result[:logs].first[:message]).to include('Missing \'restaurants\' array')
      end

      it 'handles missing restaurant name' do
        json = {
          restaurants: [
            {
              # Missing name
              menus: []
            }
          ]
        }.to_json

        result = service.import(json)

        expect(result[:success]).to be false
        expect(result[:logs]).to include(
          hash_including(level: 'error', message: including('Missing or invalid \'name\''))
        )
      end

      it 'handles missing menu name' do
        json = {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: [
                {
                  # Missing name
                  menu_items: []
                }
              ]
            }
          ]
        }.to_json

        result = service.import(json)

        expect(result[:success]).to be false
        expect(result[:logs]).to include(
          hash_including(level: 'error', message: including('Missing or invalid \'name\''))
        )
      end

      it 'handles missing menu item data' do
        json = {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: [
                {
                  name: "lunch",
                  menu_items: [
                    { price: 9.0 } # Missing name
                  ]
                }
              ]
            }
          ]
        }.to_json

        result = service.import(json)

        expect(result[:success]).to be false
        expect(result[:logs]).to include(
          hash_including(level: 'error', message: including('Missing \'name\' or \'price\''))
        )
      end
    end

    context 'with alternate format for menu items' do
      it 'handles "dishes" instead of "menu_items"' do
        json = {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: [
                {
                  name: "lunch",
                  dishes: [ # Using dishes instead of menu_items
                    { name: "Burger", price: 9.0 },
                    { name: "Salad", price: 5.0 }
                  ]
                }
              ]
            }
          ]
        }.to_json

        expect {
          result = service.import(json)
          expect(result[:success]).to be true
        }.to change(MenuItem, :count).by(2)
          .and change(MenuEntry, :count).by(2)
      end
    end

    context 'with duplicate items in the same menu' do
      it 'handles duplicate item names in the same menu' do
        json = {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: [
                {
                  name: "lunch",
                  menu_items: [
                    { name: "Chicken Wings", price: 9.0 },
                    { name: "Burger", price: 9.0 },
                    { name: "Chicken Wings", price: 9.0 } # Duplicate
                  ]
                }
              ]
            }
          ]
        }.to_json

        expect {
          result = service.import(json)
          expect(result[:success]).to be true
        }.to change(MenuItem, :count).by(2) # Only 2 unique items
          .and change(MenuEntry, :count).by(2) # Only 2 unique menu entries
      end
    end

    context 'with database transaction errors' do
      it 'handles general exceptions during import' do
        restaurant_instance = instance_double(
          Restaurant,
          new_record?: true
        )
        allow(Restaurant).to receive(:find_or_initialize_by).and_return(restaurant_instance)
        allow(restaurant_instance).to receive(:save).and_raise(StandardError.new('Test error'))

        json = {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: []
            }
          ]
        }.to_json

        result = service.import(json)

        expect(result[:success]).to be false
        expect(result[:logs]).to include(
          hash_including(level: 'error', message: including('Import failed: Test error'))
        )
      end

      it 'handles ActiveRecord::RecordInvalid exceptions during menu entry creation' do
        # First create valid data
        valid_json = {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: [
                {
                  name: "lunch",
                  menu_items: [
                    { name: "Burger", price: 9.0 }
                  ]
                }
              ]
            }
          ]
        }.to_json

        service.import(valid_json)

        allow(MenuEntry).to receive(:find_or_create_by).and_raise(ActiveRecord::RecordInvalid.new(MenuEntry.new))

        result = service.import(valid_json)

        expect(result[:success]).to be false
        expect(result[:logs]).to include(
          hash_including(level: 'error', message: including('Failed to create menu entry'))
        )
      end
    end

    context 'with restaurant containing no menus' do
      it 'logs a warning when no menus are found' do
        json = {
          restaurants: [
            {
              name: "Test Restaurant"
              # No menus array
            }
          ]
        }.to_json

        result = service.import(json)

        expect(result[:success]).to be true
        expect(result[:logs]).to include(
          hash_including(level: 'warning', message: including('No menus found for restaurant'))
        )
      end

      it 'logs a warning when menu has no items' do
        json = {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: [
                {
                  name: "empty menu",
                  menu_items: [] # Empty array
                }
              ]
            }
          ]
        }.to_json

        result = service.import(json)

        expect(result[:success]).to be true
        expect(result[:logs]).to include(
          hash_including(level: 'warning', message: including('No menu items found for menu'))
        )
      end
    end
  end
end
