import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { act } from "react"

// Mock the DOM for CSRF Token before importing apiService
const mockMetaElement = {
	getAttribute: jest.fn((attr) => {
		if (attr === "name") {
			return "mock-csrf-token"
		}
		return null
	}),
}

// Spy on document.querySelector and make it return the mock element
jest.spyOn(document, "querySelector").mockImplementation((selector) => {
	if (selector === 'meta[name="csrf-token"]') {
		return mockMetaElement
	}
	return null
})

import MenuItemForm from "./MenuItemForm"
import { createMenuItem } from "../../services/apiService"

// Mock the API service
jest.mock("../../services/apiService", () => ({
	createMenuItem: jest.fn(),
}))

describe("MenuItemForm Component", () => {
	const mockRestaurantId = 333
	const mockMenuId = 123
	const mockOnSave = jest.fn()

	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks()
	})

	afterAll(() => {
		// Restore original implementations
		jest.restoreAllMocks()
	})

	// Success case - rendering the form
	it("renders form with all required fields", () => {
		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		expect(screen.getByText("Add Menu Item")).toBeInTheDocument()
		expect(screen.getByLabelText("Item")).toBeInTheDocument()
		expect(screen.getByLabelText("Price")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument()
	})

	// Success case - checking loading state
	it("shows loading state when submitting", async () => {
		const user = userEvent.setup()

		// Mock a slow API call
		let resolveApiCall
		const apiPromise = new Promise((resolve) => {
			resolveApiCall = resolve
		})
		createMenuItem.mockReturnValue(apiPromise)

		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		// Fill out form
		await user.type(screen.getByTestId("item-name-input"), "Test Item")
		await user.type(screen.getByTestId("item-price-input"), "9.99")

		// Submit form
		await user.click(screen.getByTestId("add-item-button"))

		// Check loading state
		expect(screen.getByTestId("add-item-button")).toBeDisabled()
		expect(screen.getByTestId("add-item-button")).toHaveTextContent("Adding...")
		expect(screen.getByText("Adding...")).toBeInTheDocument()

		// Resolve the API call
		resolveApiCall({ id: 111, name: "Test Item", price: 9.99 })

		// Wait for form reset
		await waitFor(() => {
			expect(screen.getByTestId("item-name-input").value).toBe("")
			expect(screen.getByTestId("item-price-input").value).toBe("")
		})
	})

	// Success case - submitting valid data
	it("submits the form with valid data", async () => {
		const user = userEvent.setup()

		const newItem = {
			id: 111,
			name: "Test Item",
			price: 9.99,
			menu_id: mockMenuId,
		}

		createMenuItem.mockResolvedValue(newItem)

		render(
			<MenuItemForm
				restaurantId={mockRestaurantId}
				menuId={mockMenuId}
				onSave={mockOnSave}
			/>
		)

		// Fill out form
		await user.type(screen.getByTestId("item-name-input"), "Test Item")
		await user.type(screen.getByTestId("item-price-input"), "9.99")

		// Submit form
		await user.click(screen.getByTestId("add-item-button"))

		// Wait for API call to resolve
		await waitFor(() => {
			expect(createMenuItem).toHaveBeenCalledWith(
				mockRestaurantId,
				mockMenuId,
				{
					name: "Test Item",
					price: 9.99,
					menu_id: mockMenuId,
				}
			)
			expect(mockOnSave).toHaveBeenCalledWith(newItem)
			expect(screen.getByTestId("item-name-input").value).toBe("")
			expect(screen.getByTestId("item-price-input").value).toBe("")
		})
	})

	// Error case - API failure
	it("displays error when API call fails", async () => {
		const user = userEvent.setup()

		createMenuItem.mockRejectedValue(new Error("API error"))

		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		// Fill out form
		await user.type(screen.getByTestId("item-name-input"), "Test Item")
		await user.type(screen.getByTestId("item-price-input"), "9.99")

		// Submit form
		await user.click(screen.getByTestId("add-item-button"))

		// Wait for error to appear
		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
			expect(screen.getByText("Failed to add menu item")).toBeInTheDocument()
			expect(mockOnSave).not.toHaveBeenCalled()
		})

		// Form values should be preserved
		expect(screen.getByTestId("item-name-input").value).toBe("Test Item")
		expect(screen.getByTestId("item-price-input").value).toBe("9.99")
	})

	// Edge case - no menuId
	it("displays error when no menuId is provided after submission", async () => {
		render(<MenuItemForm menuId={null} onSave={mockOnSave} />)

		// Submit form
		await act(async () => {
			fireEvent.submit(screen.getByTestId("menu-item-form"))
		})

		// Error message should be displayed
		expect(screen.getByTestId("error")).toBeInTheDocument()
		expect(
			screen.getByText("Menu Item should be associated with a Menu")
		).toBeInTheDocument()
	})

	// Edge case - validation behavior
	it("prevents submission when form is invalid", async () => {
		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		// Submit empty form
		await act(async () => {
			fireEvent.submit(screen.getByTestId("menu-item-form"))
		})

		// API should not be called
		expect(createMenuItem).not.toHaveBeenCalled()

		// Error message should be displayed
		expect(screen.getByTestId("error")).toBeInTheDocument()
		expect(
			screen.getByText("Please fill out all required fields")
		).toBeInTheDocument()
	})

	// Edge case - handling different price inputs
	it("handles different price input types correctly", async () => {
		const user = userEvent.setup()

		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		const priceInput = screen.getByTestId("item-price-input")

		// Test with integer
		await user.clear(priceInput)
		await user.type(priceInput, "10")
		expect(priceInput.value).toBe("10")

		// Test with decimal
		await user.clear(priceInput)
		await user.type(priceInput, "10.99")
		expect(priceInput.value).toBe("10.99")

		// Test with invalid input that should be converted to empty string
		await user.clear(priceInput)
		await user.type(priceInput, "abc")
		expect(priceInput.value).toBe("")
	})

	// Edge case - extremely long inputs
	it("handles extremely long inputs", async () => {
		const user = userEvent.setup()

		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		const longName = "A".repeat(100)
		await user.type(screen.getByTestId("item-name-input"), longName)
		expect(screen.getByTestId("item-name-input").value).toBe(longName)
	})

	// Edge case - special characters in inputs
	it("handles special characters in inputs", async () => {
		const user = userEvent.setup()

		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		const nameWithSpecialChars = "!@#$%^&*() Special Menu Item"
		await user.type(screen.getByTestId("item-name-input"), nameWithSpecialChars)
		expect(screen.getByTestId("item-name-input").value).toBe(
			nameWithSpecialChars
		)
	})

	// Edge case - negative price
	it('allows entering negative price but should have min="0" attribute', () => {
		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		const priceInput = screen.getByTestId("item-price-input")
		expect(priceInput).toHaveAttribute("min", "0")

		// Browser validation would prevent this, but we can test the component behavior
		fireEvent.change(priceInput, { target: { name: "price", value: "-5.99" } })
		expect(priceInput.value).toBe("-5.99")
	})

	// Edge case - extremely high price
	it("handles extremely high price values", async () => {
		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		const highPrice = "9999999.99"
		fireEvent.change(screen.getByTestId("item-price-input"), {
			target: { name: "price", value: highPrice },
		})
		expect(screen.getByTestId("item-price-input").value).toBe(highPrice)
	})

	// Edge case - decimal precision
	it("handles different decimal precision in price input", async () => {
		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		// Test with more than 2 decimal places
		fireEvent.change(screen.getByTestId("item-price-input"), {
			target: { name: "price", value: "10.9999" },
		})
		expect(screen.getByTestId("item-price-input").value).toBe("10.9999")

		// The step attribute should restrict to 2 decimal places in actual browser
		expect(screen.getByTestId("item-price-input")).toHaveAttribute(
			"step",
			"0.01"
		)
	})

	// Edge case - form validation with empty price
	it("allows form submission only when all required fields are filled", async () => {
		render(<MenuItemForm menuId={mockMenuId} onSave={mockOnSave} />)

		// Fill only the name field
		userEvent.type(screen.getByTestId("item-name-input"), "Test Item")

		// Get the submit button and check if it's not clickable due to HTML validation
		const submitButton = screen.getByTestId("add-item-button")
		expect(submitButton).toBeInTheDocument()

		// Get the form and check required attributes
		const priceInput = screen.getByTestId("item-price-input")
		expect(priceInput).toHaveAttribute("required")

		const nameInput = screen.getByTestId("item-name-input")
		expect(nameInput).toHaveAttribute("required")
	})
})
