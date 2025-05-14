// Mock implementation of apiService.js
// Will be used when jest.mock("./apiService") is called
const MOCK_CSRF_TOKEN = "mock-csrf-token"
const API_BASE_URL = "/api/v1"

// Helper function for handling API responses - mirror the real implementation
const handleResponse = async (response) => {
	if (!response.ok) {
		const errorData = await response.json().catch(() => {
			throw new Error(`API error: ${response.status}`)
		})
		throw errorData.error || errorData.message || "Unknown error occured"
	}
	return response.json()
}

// Mock implementations of all exported functions

// === Menu API CALLS ===
const fetchMenus = jest.fn().mockImplementation(async () => {
	const response = await fetch(`${API_BASE_URL}/menus`)
	return handleResponse(response)
})

const fetchMenu = jest.fn().mockImplementation(async (id) => {
	const response = await fetch(`${API_BASE_URL}/menus/${id}`)
	return handleResponse(response)
})

const createMenu = jest.fn().mockImplementation(async (menuData) => {
	const response = await fetch(`${API_BASE_URL}/menus`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": MOCK_CSRF_TOKEN,
		},
		body: JSON.stringify({ menu: menuData }),
	})
	return handleResponse(response)
})

const updateMenu = jest.fn().mockImplementation(async (id, menuData) => {
	const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": MOCK_CSRF_TOKEN,
		},
		body: JSON.stringify({ menu: menuData }),
	})
	return handleResponse(response)
})

const deleteMenu = jest.fn().mockImplementation(async (id) => {
	const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
		method: "DELETE",
		headers: {
			"X-CSRF-Token": MOCK_CSRF_TOKEN,
		},
	})
	return handleResponse(response)
})

// === MenuItem API CALLS ===
const fetchMenuItems = jest.fn().mockImplementation(async (menuId) => {
	const response = await fetch(`${API_BASE_URL}/menus/${menuId}/menu_items`)
	return handleResponse(response)
})

const fetchMenuItem = jest.fn().mockImplementation(async (menuId, itemId) => {
	const response = await fetch(`${API_BASE_URL}/menus/${menuId}/menu_items/${itemId}`)
	return handleResponse(response)
})

const createMenuItem = jest.fn().mockImplementation(async (menuId, itemData) => {
	const response = await fetch(`${API_BASE_URL}/menus/${menuId}/menu_items`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": MOCK_CSRF_TOKEN,
		},
		body: JSON.stringify(itemData),
	})

	return handleResponse(response)
})

const updateMenuItem = jest.fn().mockImplementation(async (menuId, itemId, itemData) => {
	const response = await fetch(`${API_BASE_URL}/menus/${menuId}/menu_items/${itemId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": MOCK_CSRF_TOKEN,
		},
		body: JSON.stringify(itemData),
	})

	return handleResponse(response)
})

const deleteMenuItem = jest.fn().mockImplementation(async (menuId, itemId) => {
	const response = await fetch(`${API_BASE_URL}/menus/${menuId}/menu_items/${itemId}`, {
		method: "DELETE",
		headers: {
			"X-CSRF-Token": MOCK_CSRF_TOKEN,
		},
	})

	return handleResponse(response)
})

// Export all functions and constants
export {
	fetchMenus,
	fetchMenu,
	createMenu,
	updateMenu,
	deleteMenu,
	fetchMenuItems,
	fetchMenuItem,
	createMenuItem,
	updateMenuItem,
	deleteMenuItem,
	API_BASE_URL,
	MOCK_CSRF_TOKEN,
}
