import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"

// Mock the DOM for CSRF Token before importing apiService
const mockMetaElement = {
	getAttribute: jest.fn((attr) => {
		if (attr === "name") {
			return "mock-csrf-token"
		}
		return null
	}),
}

// Spy on document.querySelector and make it return the  mock element
jest.spyOn(document, "querySelector").mockImplementation((selector) => {
	if (selector === 'meta[name="csrf-token"]') {
		return mockMetaElement
	}
	return null
})

import MenuItemList from "./MenuItemList"
import { deleteMenuItem } from "../../services/apiService"

// Mock the API service
jest.mock("../../services/apiService", () => ({
	deleteMenuItem: jest.fn(),
}))

// Mock the MenuItemForm component
jest.mock("./MenuItemForm", () => {
	return function MockMenuItemForm({ menuId, onSave }) {
		return (
			<div data-testid="menu-item-form-mock">
				<button
					onClick={() =>
						onSave({ id: "new-item-id", name: "New Item", price: 12.99 })
					}
					data-testid="mock-save-button"
				>
					Save Mock Item
				</button>
			</div>
		)
	}
})

describe("MenuItemList Component", () => {
	const mockMenuId = 1
	const mockMenuItems = [
		{ id: 1, name: "Burger", price: 10.99 },
		{ id: 2, name: "Pizza", price: 12.99 },
	]
	const mockUpdateMenuItems = jest.fn()

	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks()
		window.confirm = jest.fn()
	})

	afterAll(() => {
		// Restore original implementations
		jest.restoreAllMocks()
	})

	// Success case - rendering with items
	it("renders menu items correctly", () => {
		render(
			<MenuItemList
				menuId={mockMenuId}
				menuItems={mockMenuItems}
				onUpdateMenuItems={mockUpdateMenuItems}
			/>
		)

		expect(screen.getByText("Menu Items")).toBeInTheDocument()
		expect(screen.getByText("Burger")).toBeInTheDocument()
		expect(screen.getByText("Pizza")).toBeInTheDocument()
		expect(screen.getByText("$10.99")).toBeInTheDocument()
		expect(screen.getByText("$12.99")).toBeInTheDocument()
	})

	// Edge case - empty menu items
	it("renders empty state when no items exist", () => {
		render(
			<MenuItemList
				menuId={mockMenuId}
				menuItems={[]}
				onUpdateMenuItems={mockUpdateMenuItems}
			/>
		)

		expect(screen.getByTestId("no-items")).toBeInTheDocument()
		expect(screen.getByText("No items in this menu")).toBeInTheDocument()
	})

	// User interaction test
	it("toggles add item form visibility when button clicked", () => {
		render(
			<MenuItemList
				menuId={mockMenuId}
				menuItems={mockMenuItems}
				onUpdateMenuItems={mockUpdateMenuItems}
			/>
		)

		// Form should be hidden initially
		expect(screen.queryByTestId("menu-item-form-mock")).not.toBeInTheDocument()

		// Click to show form
		fireEvent.click(screen.getByTestId("toggle-add-item"))
		expect(screen.getByTestId("menu-item-form-mock")).toBeInTheDocument()
		expect(screen.getByText("Cancel")).toBeInTheDocument()

		// Click to hide form
		fireEvent.click(screen.getByTestId("toggle-add-item"))
		expect(screen.queryByTestId("menu-item-form-mock")).not.toBeInTheDocument()
		expect(screen.getByText("Add Item")).toBeInTheDocument()
	})

	// Success case - adding a new item
	it("adds a new menu item successfully", () => {
		render(
			<MenuItemList
				menuId={mockMenuId}
				menuItems={mockMenuItems}
				onUpdateMenuItems={mockUpdateMenuItems}
			/>
		)

		// Open the form
		fireEvent.click(screen.getByTestId("toggle-add-item"))

		// Save new item
		fireEvent.click(screen.getByTestId("mock-save-button"))

		// Check if update function was called with correct data
		expect(mockUpdateMenuItems).toHaveBeenCalledWith([
			...mockMenuItems,
			{ id: "new-item-id", name: "New Item", price: 12.99 },
		])

		// Form should be hidden after saving
		expect(screen.queryByTestId("menu-item-form-mock")).not.toBeInTheDocument()
	})

	// Success case - deleting an item with confirmation
	it("deletes menu item when confirmed", async () => {
		// Setup confirmation to return true
		window.confirm.mockReturnValue(true)
		deleteMenuItem.mockResolvedValue({})

		render(
			<MenuItemList
				menuId={mockMenuId}
				menuItems={mockMenuItems}
				onUpdateMenuItems={mockUpdateMenuItems}
			/>
		)

		// Click delete button for first item
		fireEvent.click(screen.getByTestId("delete-item-1"))

		// Check confirmation dialog
		expect(window.confirm).toHaveBeenCalledWith(
			"Are you sure you want to delete this item?"
		)

		// Wait for API call to resolve
		await waitFor(() => {
			expect(deleteMenuItem).toHaveBeenCalledWith(mockMenuId, 1)
			expect(mockUpdateMenuItems).toHaveBeenCalledWith([mockMenuItems[1]])
		})
	})

	// Edge case - cancelling deletion
	it("does not delete menu item when confirmation is cancelled", async () => {
		// Setup confirmation to return false
		window.confirm.mockReturnValue(false)

		render(
			<MenuItemList
				menuId={mockMenuId}
				menuItems={mockMenuItems}
				onUpdateMenuItems={mockUpdateMenuItems}
			/>
		)

		// Click delete button for first item
		fireEvent.click(screen.getByTestId("delete-item-1"))

		// Check confirmation dialog
		expect(window.confirm).toHaveBeenCalledWith(
			"Are you sure you want to delete this item?"
		)

		// Wait to ensure API not called
		await waitFor(() => {
			expect(deleteMenuItem).not.toHaveBeenCalled()
			expect(mockUpdateMenuItems).not.toHaveBeenCalled()
		})
	})

	// Edge case - deletion API failure
	it("shows error when delete API call fails", async () => {
		// Setup confirmation to return true but API to fail
		window.confirm.mockReturnValue(true)
		const errorMessage = "Failed to delete menu item"
		deleteMenuItem.mockRejectedValue(new Error(errorMessage))

		render(
			<MenuItemList
				menuId={mockMenuId}
				menuItems={mockMenuItems}
				onUpdateMenuItems={mockUpdateMenuItems}
			/>
		)

		// Error should not be visible initially
		expect(screen.queryByTestId("error")).not.toBeInTheDocument()

		// Click delete button
		fireEvent.click(screen.getByTestId("delete-item-1"))

		// Wait for error to appear
		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
			expect(screen.getByText(errorMessage)).toBeInTheDocument()
			expect(mockUpdateMenuItems).not.toHaveBeenCalled()
		})

		// Verify menu items are still displayed
		expect(screen.getByText("Burger")).toBeInTheDocument()
		expect(screen.getByText("Pizza")).toBeInTheDocument()
	})

	// Edge case - price formatting with different types
	it("handles different price formats correctly", () => {
		const itemsWithDifferentPrices = [
			{ id: 1, name: "Integer Price", price: 10 },
			{ id: 2, name: "String Price", price: "12.50" },
			{ id: 3, name: "Float Price", price: 8.99 },
		]

		render(
			<MenuItemList
				menuId={mockMenuId}
				menuItems={itemsWithDifferentPrices}
				onUpdateMenuItems={mockUpdateMenuItems}
			/>
		)

		// Check price formatting
		expect(screen.getByText("$10.00")).toBeInTheDocument()
		expect(screen.getByText("$12.50")).toBeInTheDocument()
		expect(screen.getByText("$8.99")).toBeInTheDocument()
	})
})
