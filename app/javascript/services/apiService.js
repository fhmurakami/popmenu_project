const csrfToken = document
	.querySelector('meta[name="csrf-token"]')
	.getAttribute("content")
// Define the base API URL
const API_BASE_URL = "/api/v1"

// Helper function for handling API responses
const handleResponse = async (response) => {
	if (!response.ok) {
		const errorData = await response.json().catch(() => {
			throw new Error(`API error: ${response.status}`)
		})
		throw errorData.error || errorData.message || "Unknown error occurred"
	}
	return response.json()
}

// === Restaurant API CALLS ===

// Fetch all restaurants
export const fetchRestaurants = async () => {
	const response = await fetch(`${API_BASE_URL}/restaurants`)
	return handleResponse(response)
}

// Fetch a single restaurant by ID
export const fetchRestaurant = async (restaurantId) => {
	const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`)
	return handleResponse(response)
}

// Create a new restaurant
export const createRestaurant = async (restaurantData) => {
	const response = await fetch(`${API_BASE_URL}/restaurants`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": csrfToken,
		},
		body: JSON.stringify({ restaurant: restaurantData }),
	})
	return handleResponse(response)
}

// Update an existing restaurant
export const updateRestaurant = async (restaurantId, restaurantData) => {
	const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": csrfToken,
		},
		body: JSON.stringify({ restaurant: restaurantData }),
	})
	return handleResponse(response)
}

// Delete a restaurant
export const deleteRestaurant = async (restaurantId) => {
	const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
		method: "DELETE",
		headers: {
			"X-CSRF-Token": csrfToken,
		},
	})

	return handleResponse(response)
}

// === Menu API CALLS ===

// Fetch all menus
export const fetchMenus = async (restaurantId) => {
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus`
	)
	return handleResponse(response)
}

// Fetch a single menu by ID
export const fetchMenu = async (restaurantId, menuId) => {
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus/${menuId}`
	)
	return handleResponse(response)
}

// Create a new menu
export const createMenu = async (restaurantId, menuData) => {
	console.log("Creating menu with data:", menuData)
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": csrfToken,
			},
			body: JSON.stringify({ menu: menuData }),
		}
	)
	return handleResponse(response)
}

// Update an existing menu
export const updateMenu = async (restaurantId, menuId, menuData) => {
	console.log("Updating menu with data:", menuData)
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus/${menuId}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": csrfToken,
			},
			body: JSON.stringify({ menu: menuData }),
		}
	)
	return handleResponse(response)
}

// Delete a menu
export const deleteMenu = async (restaurantId, menuId) => {
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus/${menuId}`,
		{
			method: "DELETE",
			headers: {
				"X-CSRF-Token": csrfToken,
			},
		}
	)

	return handleResponse(response)
}

// === MenuItem API CALLS ===
export const fetchMenuItems = async (restaurantId, menuId) => {
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus/${menuId}/menu_items`
	)
	return handleResponse(response)
}

export const fetchMenuItem = async (restaurantId, menuId, itemId) => {
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus/${menuId}/menu_items/${itemId}`
	)
	return handleResponse(response)
}

export const createMenuItem = async (restaurantId, menuId, itemData) => {
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus/${menuId}/menu_items`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": csrfToken,
			},
			body: JSON.stringify({ menu_item: itemData }),
		}
	)

	return handleResponse(response)
}

export const updateMenuItem = async (
	restaurantId,
	menuId,
	itemId,
	itemData
) => {
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus/${menuId}/menu_items/${itemId}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": csrfToken,
			},
			body: JSON.stringify({ menu_item: itemData }),
		}
	)

	return handleResponse(response)
}

export const deleteMenuItem = async (restaurantId, menuId, itemId) => {
	const response = await fetch(
		`${API_BASE_URL}/restaurants/${restaurantId}/menus/${menuId}/menu_items/${itemId}`,
		{
			method: "DELETE",
			headers: {
				"X-CSRF-Token": csrfToken,
			},
		}
	)

	return handleResponse(response)
}
