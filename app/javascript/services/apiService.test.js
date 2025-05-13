// Tell Jest to use the manual mock for apiService
jest.mock("./apiService")

// Import the mocked apiService
import * as apiService from "./apiService"

describe("apiService", () => {
	const mockData = [
		{ id: 1, name: "Lunch Menu" },
		{ id: 2, name: "Dinner Menu" },
	]

	// Get constants from the mock for testing
	const { API_BASE_URL, MOCK_CSRF_TOKEN } = apiService

	beforeEach(() => {
		jest.clearAllMocks()

		// Set up global fetch mock
		global.fetch = jest.fn()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	describe("fetchMenus", () => {
		it("should fetch all menus successfully", async () => {
			// Arrange
			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
			})

			// Act
			const result = await apiService.fetchMenus()

			// Assert
			expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/menus`)
			expect(result).toEqual(mockData)
		})

		it("should handle API errors", async () => {
			// Arrange
			const errorMessage = "Failed to fetch menus"
			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.fetchMenus()).rejects.toEqual(errorMessage)
		})

		it("should handle when no menus exist", async () => {
			// Arrange
			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve([]),
			})

			// Act
			const result = await apiService.fetchMenus()

			// Assert
			expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/menus`)
			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should handle network errors", async () => {
			// Arrange
			const errorMessage = "Network error"
			global.fetch.mockRejectedValueOnce(new Error(errorMessage))

			// Act & Assert
			await expect(apiService.fetchMenus()).rejects.toThrow(errorMessage)
		})

		it("should handle malformed JSON response", async () => {
			// Arrange
			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.reject(new Error("Invalid JSON")),
			})

			// Act & Assert
			await expect(apiService.fetchMenus()).rejects.toThrow("Invalid JSON")
		})
	})

	describe("fetchMenu", () => {
		it("should fetch a single menu by ID", async () => {
			// Arrange
			const menuId = 1
			const menuData = mockData[0]

			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(menuData),
			})

			// Act
			const result = await apiService.fetchMenu(menuId)

			// Assert
			expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/menus/${menuId}`)
			expect(result).toEqual(menuData)
		})

		it("should handle when menu does not exist", async () => {
			// Arrange
			const menuId = 999
			const errorMessage = "Menu not found"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.fetchMenu(menuId)).rejects.toEqual(errorMessage)
		})

		it("should handle server error when fetching a menu", async () => {
			// Arrange
			const menuId = 1
			const errorMessage = "Internal server error"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.fetchMenu(menuId)).rejects.toEqual(errorMessage)
		})

		it("should handle invalid menu ID", async () => {
			// Arrange
			const menuId = "invalid"
			const errorMessage = "Invalid menu ID"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.fetchMenu(menuId)).rejects.toEqual(errorMessage)
		})
	})

	describe("createMenu", () => {
		it("should create a new menu", async () => {
			// Arrange
			const newMenu = { name: "Breakfast Menu" }
			const responseData = { id: 3, ...newMenu }

			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(responseData),
			})

			// Act
			const result = await apiService.createMenu(newMenu)

			// Assert
			expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/menus`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": MOCK_CSRF_TOKEN,
				},
				body: JSON.stringify({ menu: newMenu }),
			})
			expect(result).toEqual(responseData)
		})

		it("should handle validation errors when creating a menu", async () => {
			// Arrange
			const invalidMenu = { name: "" }
			const errorMessage = "Name can't be blank"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 422,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.createMenu(invalidMenu)).rejects.toEqual(errorMessage)
		})

		it("should handle server errors when creating a menu", async () => {
			// Arrange
			const newMenu = { name: "Brunch Menu" }
			const errorMessage = "Database connection error"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.createMenu(newMenu)).rejects.toEqual(errorMessage)
		})

		it("should handle missing CSRF token", async () => {
			// Arrange
			const newMenu = { name: "Test Menu" }
			const errorMessage = "Invalid authenticity token"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 422,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.createMenu(newMenu)).rejects.toEqual(errorMessage)
		})
	})

	describe("updateMenu", () => {
		it("should update an existing menu", async () => {
			// Arrange
			const menuId = 1
			const menuUpdates = { name: "Updated Lunch Menu" }
			const responseData = { id: menuId, ...menuUpdates }

			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(responseData),
			})

			// Act
			const result = await apiService.updateMenu(menuId, menuUpdates)

			// Assert
			expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/menus/${menuId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": MOCK_CSRF_TOKEN,
				},
				body: JSON.stringify({ menu: menuUpdates }),
			})
			expect(result).toEqual(responseData)
		})

		it("should handle when menu to update doesn't exist", async () => {
			// Arrange
			const menuId = 999
			const menuUpdates = { name: "Non-existent Menu" }
			const errorMessage = "Menu not found"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.updateMenu(menuId, menuUpdates)).rejects.toEqual(errorMessage)
		})

		it("should handle validation errors when updating a menu", async () => {
			// Arrange
			const menuId = 1
			const invalidUpdates = { name: "" }
			const errorMessage = "Name can't be blank"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 422,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.updateMenu(menuId, invalidUpdates)).rejects.toEqual(errorMessage)
		})
	})

	describe("deleteMenu", () => {
		it("should delete a menu", async () => {
			// Arrange
			const menuId = 1
			const responseData = { success: true }

			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(responseData),
			})

			// Act
			const result = await apiService.deleteMenu(menuId)

			// Assert
			expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/menus/${menuId}`, {
				method: "DELETE",
				headers: {
					"X-CSRF-Token": MOCK_CSRF_TOKEN,
				},
			})
			expect(result).toEqual(responseData)
		})

		it("should handle when menu to delete doesn't exist", async () => {
			// Arrange
			const menuId = 999
			const errorMessage = "Menu not found"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.deleteMenu(menuId)).rejects.toEqual(errorMessage)
		})

		it("should handle server error during deletion", async () => {
			// Arrange
			const menuId = 1
			const errorMessage = "Internal server error during deletion"

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.resolve({ error: errorMessage }),
			})

			// Act & Assert
			await expect(apiService.deleteMenu(menuId)).rejects.toEqual(errorMessage)
		})
	})
	// === GENERAL ERROR HANDLING TESTS ===
	describe("general error handling", () => {
		it("should handle non-JSON errors", async () => {
			// Arrange
			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error("Invalid JSON")),
			})

			// Act & Assert
			await expect(apiService.fetchMenus()).rejects.toThrow("API error: 500")
		})

		it("should handle network timeouts", async () => {
			// Arrange
			const timeoutError = new Error("Request timeout")
			global.fetch.mockRejectedValueOnce(timeoutError)

			// Act & Assert
			await expect(apiService.fetchMenus()).rejects.toThrow(timeoutError)
		})

		it("should handle CORS errors", async () => {
			// Arrange
			const corsError = new Error("CORS error")
			global.fetch.mockRejectedValueOnce(corsError)

			// Act & Assert
			await expect(apiService.fetchMenus()).rejects.toThrow(corsError)
		})
	})
})
