const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content")
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

// === MENU API CALLS ===

// Fetch all menus
export const fetchMenus = async () => {
	const response = await fetch(`${API_BASE_URL}/menus`)
	return handleResponse(response)
}

// Fetch a single menu by ID
export const fetchMenu = async (id) => {
	const response = await fetch(`${API_BASE_URL}/menus/${id}`)
	return handleResponse(response)
}

// Create a new menu
export const createMenu = async (menuData) => {
	const response = await fetch(`${API_BASE_URL}/menus`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": csrfToken,
		},
		body: JSON.stringify({ menu: menuData }),
	})
	return handleResponse(response)
}

// Update an existing menu
export const updateMenu = async (id, menuData) => {
	const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": csrfToken,
		},
		body: JSON.stringify({ menu: menuData }),
	})
	return handleResponse(response)
}

// Delete a menu
export const deleteMenu = async (id) => {
	const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
		method: "DELETE",
		headers: {
			"X-CSRF-Token": csrfToken,
		},
	})

	return handleResponse(response)
}
