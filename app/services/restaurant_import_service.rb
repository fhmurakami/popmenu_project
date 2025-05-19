class RestaurantImportService
  attr_reader :logs, :success

  def initialize
    @logs = []
    @success = true
  end

  def import(json_data)
    begin
      data = parse_json(json_data)

      if data.nil? || !data.key?("restaurants") || !data["restaurants"].is_a?(Array)
        log_error("Invalid JSON format: Missing 'restaurants' array")
        return { success: false, logs: @logs }
      end

      ActiveRecord::Base.transaction do
        data["restaurants"].each do |restaurant_data|
          process_restaurant(restaurant_data)
        end
      end

    rescue StandardError => e
      @success = false
      log_error("Import failed: #{e.message}")
    end

    { success: @success, logs: @logs }
  end

  private

  def parse_json(json_data)
    JSON.parse(json_data)
  rescue JSON::ParserError => e
    @success = false
    log_error("JSON parsing error: #{e.message}")
    nil
  end

  def process_restaurant(restaurant_data)
    # Validate restaurant data
    unless restaurant_data.key?("name") && restaurant_data["name"].is_a?(String)
      log_error("Invalid restaurant data: Missing or invalid 'name'")
      @success = false
      return
    end

    # Find or create restaurant
    restaurant = Restaurant.find_or_create_by(name: restaurant_data["name"])
    log_info("Restaurant: #{restaurant.name} (#{restaurant.new_record? ? 'Created' : 'Found'})")

    # Process menus if present
    if restaurant_data.key?("menus") && restaurant_data["menus"].is_a?(Array)
      restaurant_data["menus"].each do |menu_data|
        process_menu(restaurant, menu_data)
      end
    else
      log_warning("No menus found for restaurant: #{restaurant.name}")
    end
  end

  def process_menu(restaurant, menu_data)
    # Validate menu data
    unless menu_data.key?("name") && menu_data["name"].is_a?(String)
      log_error("Invalid menu data: Missing or invalid 'name'")
      @success = false
      return
    end

    # Find or create menu
    menu = restaurant.menus.find_or_create_by(name: menu_data["name"])
    log_info("Menu: #{menu.name} (#{menu.new_record? ? 'Created' : 'Found'})")

    # Process menu items
    menu_items = menu_data["menu_items"] || menu_data["dishes"] || []

    if menu_items.empty?
      log_warning("No menu items found for menu: #{menu.name}")
      return
    end

    menu_items.each do |item_data|
      process_menu_item(menu, item_data)
    end
  end

  def process_menu_item(menu, item_data)
    # Validate menu item data
    unless item_data.key?("name") && item_data.key?("price")
      log_error("Invalid menu item data: Missing 'name' or 'price'")
      @success = false
      return
    end

    item_name = item_data["name"].strip
    item_price = item_data["price"].to_f

    # Find or create menu item (keeping them unique in the database)
    menu_item = MenuItem.find_or_create_by(name: item_name)

    if menu_item.new_record?
      log_info("Menu item: #{item_name} (Created)")
    else
      log_info("Menu item: #{item_name} (Found existing)")
    end

    # Create the menu entry (join model) with the specified price
    begin
      # Check if the menu entry already exists
      menu_entry = MenuEntry.find_or_create_by(
        menu_id: menu.id,
        menu_item_id: menu_item.id
      )

      # Update the price if it's different
      if menu_entry.price != item_price
        menu_entry.update(price: item_price)
        log_info("Menu entry: #{item_name} on #{menu.name} menu - price updated to $#{item_price}")
      else
        log_info("Menu entry: #{item_name} on #{menu.name} menu - price $#{item_price}")
      end
    rescue ActiveRecord::RecordInvalid => e
      log_error("Failed to create menu entry for '#{item_name}': #{e.message}")
      @success = false
    end
  end


  # Logs an informational message with the given content.
  # The message is stored in the logs with an "info" level.
  #
  # @param message [String] the informational message to log

  def log_info(message)
    @logs << { level: "info", message: message }
  end

  def log_warning(message)
    @logs << { level: "warning", message: message }
  end

  def log_error(message)
    @logs << { level: "error", message: message }
    @success = false
  end
end
