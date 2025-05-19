# API Documentation

This document provides detailed information about the APIs available in the Restaurant Menu Management System.

## Base URL

All APIs are prefixed with `/api/v1`.

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## Error Handling

All API endpoints follow a consistent error format:

```json
{
	"error": "Error message",
	"status": 400
}
```

Common HTTP status codes:

- 200 OK - Request succeeded
- 201 Created - Resource created successfully
- 400 Bad Request - Invalid request parameters
- 404 Not Found - Resource not found
- 422 Unprocessable Entity - Validation errors
- 500 Internal Server Error - Server error

## Restaurants API

### List Restaurants

Retrieves a list of all restaurants.

**Endpoint:** `GET /api/v1/restaurants`

**Response Format:**

```json
[
	{
		"id": 1,
		"name": "The Restaurant",
		"address": "123 Main St, Anytown, USA",
		"phone": "555-1234",
		"website": "myrestaurant.com",
		"description": "My super famous restaurant",
		"menus": [
			{
				"id": 1,
				"name": "Lunch Menu",
				"menu_items": [
					{
						"id": 1,
						"name": "Caesar Salad",
						"price": "8.99",
						"description": "Crisp romaine lettuce with Caesar dressing",
						"category": "Salad",
						"dietary_restrictions": "Vegetarian",
						"ingredients": "Romaine lettuce, Caesar dressing, croutons"
					},
					{
						"id": 2,
						"name": "Grilled Chicken Sandwich",
						"price": "10.99",
						"description": "Grilled chicken breast with lettuce and tomato",
						"category": "Sandwich",
						"dietary_restrictions": "None",
						"ingredients": "Australian Bread, Grilled chicken, lettuce, tomato, mayonnaise"
					},
					{
						"id": 6,
						"name": "Broccoli and Bacon Pizza",
						"price": "12.5",
						"description": "A very delicious pizza",
						"category": "Fast food",
						"dietary_restrictions": null,
						"ingredients": "Mozzarella, Broccoli, Bacon, Toasted Garlic"
					}
				]
			}
		]
	}
]
```

### Get a Restaurant

Retrieves details of a specific restaurant.

**Endpoint:** `GET /api/v1/restaurants/:id`

**Response Format:**

```json
{
	"id": 1,
	"name": "The Restaurant",
	"address": "123 Main St, Anytown, USA",
	"phone": "555-1234",
	"website": "myrestaurant.com",
	"description": "My super famous restaurant",
	"menus": [
		{
			"id": 1,
			"name": "Lunch Menu",
			"menu_items": [
				{
					"id": 1,
					"name": "Caesar Salad",
					"price": "8.99",
					"description": "Crisp romaine lettuce with Caesar dressing",
					"category": "Salad",
					"dietary_restrictions": "Vegetarian",
					"ingredients": "Romaine lettuce, Caesar dressing, croutons"
				}
			]
		}
	]
}
```

### Create a Restaurant

Creates a new restaurant.

**Endpoint:** `POST /api/v1/restaurants`

**Request Format:**

```json
{
	"name": "New Restaurant"
}
```

**Response Format:**

```json
{
	"id": 2,
	"name": "New Restaurant",
	"menus": []
}
```

### Update a Restaurant

Updates an existing restaurant.

**Endpoint:** `PUT /api/v1/restaurants/:id`

**Request Format:**

```json
{
	"name": "Updated Restaurant Name"
}
```

**Response Format:**

```json
{
	"id": 2,
	"name": "Updated Restaurant Name",
	"menus": []
}
```

### Delete a Restaurant

Deletes a restaurant.

**Endpoint:** `DELETE /api/v1/restaurants/:id`

**Response Format:**

```json
{
	"message": "Restaurant deleted successfully"
}
```

## Menus API

### List Menus for a Restaurant

Retrieves all menus for a specific restaurant.

**Endpoint:** `GET /api/v1/restaurants/:restaurant_id/menus`

**Response Format:**

```json
[
	{
		"id": 1,
		"name": "Lunch Menu",
		"menu_items": []
	}
]
```

### Get a Specific Menu

Retrieves details of a specific menu.

**Endpoint:** `GET /api/v1/restaurants/:restaurant_id/menus/:id`

**Response Format:**

```json
{
	"id": 1,
	"name": "Lunch Menu",
	"menu_items": [
		{
			"id": 1,
			"name": "Caesar Salad",
			"price": "8.99",
			"description": "Crisp romaine lettuce with Caesar dressing",
			"category": "Salad",
			"dietary_restrictions": "Vegetarian",
			"ingredients": "Romaine lettuce, Caesar dressing, croutons"
		}
	]
}
```

### Create a Menu

Creates a new menu for a restaurant.

**Endpoint:** `POST /api/v1/restaurants/:restaurant_id/menus`

**Request Format:**

```json
{
	"name": "Dinner Menu"
}
```

**Response Format:**

```json
{
	"id": 2,
	"name": "Dinner Menu",
	"menu_items": []
}
```

### Update a Menu

Updates an existing menu.

**Endpoint:** `PUT /api/v1/restaurants/:restaurant_id/menus/:id`

**Request Format:**

```json
{
	"name": "Updated Menu Name"
}
```

**Response Format:**

```json
{
	"id": 2,
	"name": "Updated Menu Name",
	"menu_items": []
}
```

### Delete a Menu

Deletes a menu.

**Endpoint:** `DELETE /api/v1/restaurants/:restaurant_id/menus/:id`

**Response Format:**

```json
{
	"message": "Menu deleted successfully"
}
```

## Menu Items API

### List Menu Items

Retrieves all menu items.

**Endpoint:** `GET /api/v1/restaurants/:id/menus/:menu_id/menu_items`

**Response Format:**

```json
[
	{
		"id": 1,
		"name": "Caesar Salad",
		"price": "8.99",
		"description": "Crisp romaine lettuce with Caesar dressing",
		"category": "Salad",
		"dietary_restrictions": "Vegetarian",
		"ingredients": "Romaine lettuce, Caesar dressing, croutons"
	}
]
```

### Get a Menu Item

Retrieves details of a specific menu item.

**Endpoint:** `GET /api/v1/restaurants/:id/menus/:menu_id/menu_items/:id`

**Response Format:**

```json
{
	"id": 1,
	"name": "Caesar Salad",
	"price": "8.99",
	"description": "Crisp romaine lettuce with Caesar dressing",
	"category": "Salad",
	"dietary_restrictions": "Vegetarian",
	"ingredients": "Romaine lettuce, Caesar dressing, croutons"
}
```

### Create a Menu Item

Creates a new menu item.

**Endpoint:** `POST /api/v1/restaurants/:id/menus/:menu_id/menu_items`

**Request Format:**

```json
{
	"menu_item": {
		"name": "Broccoli and Bacon Pizza",
		"price": "10.00",
		"description": "A very delicious pizza",
		"category": "Fast food",
		"dietary_restriction": "None",
		"ingredients": "Mozzarella, Broccoli, Bacon, Toasted Garlic",
		"menu_id": "1"
	}
}
```

**Response Format:**

```json
{
	"id": 2,
	"name": "Broccoli and Bacon Pizza",
	"price": "10.0",
	"description": "A very delicious pizza",
	"category": "Fast food",
	"dietary_restrictions": null,
	"ingredients": "Mozzarella, Broccoli, Bacon, Toasted Garlic"
}
```

### Update a Menu Item

Updates an existing menu item.

**Endpoint:** `PUT /api/v1/restaurants/:id/menus/:menu_id/menu_items/:id`

**Request Format:**

```json
{
	"menu_item": {
		"name": "Updated Item Name",
    "price": "10.0",
    "description": "Updated description",
    "category": "Updated category",
    "dietary_restrictions": "Updated dietary restrictions",
    "ingredients": "Updated ingredients"
		"menu_id": "1"
	}
}
```

**Response Format:**

```json
{
	"id": 2,
	"name": "Updated Item Name",
	"price": "10.0",
	"description": "Updated description",
	"category": "Updated category",
	"dietary_restrictions": "Updated dietary restrictions",
	"ingredients": "Updated ingredients"
}
```

### Delete a Menu Item

Deletes a menu item.

**Endpoint:** `DELETE /api/v1/restaurants/:id/menus/:menu_id/menu_items/:id`

**Response Format:**

```json
{
	"message": "Item deleted successfully"
}
```

## Restaurant Imports API

### Import Restaurant Data

Imports restaurant data from a JSON file.

**Endpoint:** `POST /api/v1/restaurant_imports`

**Request Format:**
Multipart form data with a `file` field containing the JSON file.

**Response Format:**

```json
{
	"success": true,
	"logs": [
		{
			"level": "info",
			"message": "Restaurant: Restaurant Name (Created)"
		},
		{
			"level": "info",
			"message": "Menu: Lunch Menu (Created)"
		},
		{
			"level": "info",
			"message": "Menu item: Burger (Created)"
		},
		{
			"level": "info",
			"message": "Menu entry: Burger on Lunch Menu - price $9.0"
		}
	]
}
```

In case of errors:

```json
{
	"success": false,
	"logs": [
		{
			"level": "error",
			"message": "JSON parsing error: Unexpected token"
		}
	]
}
```
