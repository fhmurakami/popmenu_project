# Restaurant Menu Management System

A Ruby on Rails application for managing restaurant menus with a JSON import feature. This project was built as an interview assignment demonstrating a robust backend API with proper testing and documentation.

## Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Project Setup](#project-setup)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [JSON Import Tool](#json-import-tool)
- [Running Tests](#running-tests)
- [Development Approach](#development-approach)

## Features

The application provides the following features:

- **Level 1: Basic Menu Management**

  - CRUD operations for Menu and MenuItem objects
  - Proper relationship modeling
  - Well-tested API endpoints

- **Level 2: Multiple Menus Per Restaurant**

  - Restaurant model with multiple menus
  - Unique MenuItem names across the system
  - Menu items can appear on multiple menus with different prices

- **Level 3: JSON Import Tool**
  - HTTP endpoint for importing restaurant data from JSON files
  - Command line tool for imports via rake task
  - Comprehensive logging and error handling
  - Support for different JSON structures

## System Requirements

- Ruby 3.4.x
- Rails 8.0.x
- PostgreSQL 17+
- Node.js 22+ (for React frontend)
- Yarn or npm

## Project Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/fhmurakami/popmenu_project.git
   cd popmenu_project
   ```

2. **Install dependencies**

   ```bash
   bundle install
   yarn install # or npm install
   ```

3. **Set up the database**

   ```bash
   rails db:create
   rails db:migrate
   rails db:seed # optional - seeds the database with sample data
   ```

4. **Start the application**

   ```bash
   # Start Rails server
   rails server # or bin/dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## Data Models

The application has the following data models:

- **Restaurant**

  - Has many Menus
  - Attributes: name, address, phone, website, description.

- **Menu**

  - Belongs to a Restaurant
  - Has many MenuItems through MenuEntries
  - Attributes: name.

- **MenuItem**

  - Has many Menus through MenuEntries
  - Attributes: name.

- **MenuEntry** (Join model)
  - Belongs to a Menu
  - Belongs to a MenuItem
  - Attributes: price, description, category, dietary restrictions, ingredients.

### Entity-Relationship Diagram

```
Restaurant ──┐
             │
             │ has_many
             │
             ▼
            Menu ◄────┐
             │        │
             │ has_many │
             │        │
             ▼        │
        MenuEntry     │
             │        │
             │ belongs_to
             │        │
             ▼        │
         MenuItem ────┘
```

## API Endpoints

### Restaurants

- `GET /api/v1/restaurants` - List all restaurants
- `GET /api/v1/restaurants/:id` - Get a specific restaurant
- `POST /api/v1/restaurants` - Create a new restaurant
- `PUT /api/v1/restaurants/:id` - Update a restaurant
- `DELETE /api/v1/restaurants/:id` - Delete a restaurant

### Menus

- `GET /api/v1/restaurants/:restaurant_id/menus` - List all menus for a restaurant
- `GET /api/v1/restaurants/:restaurant_id/menus/:id` - Get a specific menu
- `POST /api/v1/restaurants/:restaurant_id/menus` - Create a new menu
- `PUT /api/v1/restaurants/:restaurant_id/menus/:id` - Update a menu
- `DELETE /api/v1/restaurants/:restaurant_id/menus/:id` - Delete a menu

### Menu Items

- `GET /api/v1/menu_items` - List all menu items
- `GET /api/v1/menu_items/:id` - Get a specific menu item
- `POST /api/v1/menu_items` - Create a new menu item
- `PUT /api/v1/menu_items/:id` - Update a menu item
- `DELETE /api/v1/menu_items/:id` - Delete a menu item

### Menu Items for a Specific Menu

- `GET /api/v1/menus/:menu_id/menu_items` - List all menu items for a menu

### Import

- `POST /api/v1/restaurant_imports` - Import restaurant data from a JSON file

## JSON Import Tool

The application features a tool for importing restaurant data from JSON files.

### Expected JSON Format

```json
{
	"restaurants": [
		{
			"name": "Restaurant Name",
			"menus": [
				{
					"name": "Menu Name",
					"menu_items": [
						{ "name": "Item Name", "price": 9.0 },
						{ "name": "Another Item", "price": 5.0 }
					]
				}
			]
		}
	]
}
```

The tool also supports `dishes` instead of `menu_items` for flexibility.

### Import Methods

#### 1. HTTP API Endpoint

You can upload a JSON file via the API:

```bash
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/restaurant_data.json" \
  http://localhost:3000/api/v1/restaurant_imports
```

The response will include success status and detailed logs for each imported item.

#### 2. Rake Task

You can also import using a rake task:

```bash
rake import:restaurants[path/to/restaurant_data.json]
```

This will display logs in the console and set the exit code based on success/failure.

### Import Process

The import process:

1. Parses the JSON file
2. Creates or finds restaurants by name
3. For each restaurant, creates or finds menus by name
4. For each menu, processes menu items:
   - Finds or creates menu items by name (ensuring uniqueness)
   - Creates menu entries with the appropriate prices
5. Logs each step and any errors
6. Returns a comprehensive report

## Running Tests

The project has comprehensive test coverage using RSpec:

```bash
# Run all tests
bundle exec rspec

# Run specific test files
bundle exec rspec spec/models/restaurant_spec.rb
bundle exec rspec spec/services/restaurant_import_service_spec.rb
```

## Development Approach

This project was developed following an iterative approach, tackling one level at a time as per the requirements. Each level was completed with proper testing before moving on to the next.

### Key Design Decisions

1. **Service Object Pattern** - Used for complex operations like the JSON import process
2. **Comprehensive Logging** - Detailed logging for import operations
3. **Error Handling** - Robust error handling for API endpoints and import operations
4. **Transaction Support** - Database transactions to ensure data integrity
5. **Test-Driven Development** - Extensive test coverage for all features

### Assumptions

- Menu item names are globally unique across the system
- The same menu item can have different prices on different menus
- Import operations should be idempotent (can be run multiple times with the same data)
- JSON format might have variations (like "dishes" vs "menu_items") that should be handled gracefully
