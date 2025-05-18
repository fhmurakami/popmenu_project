import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom"
import { renderWithRoute } from "../../tests/testUtils"
import "@testing-library/jest-dom"

// Mock CSRF Token
const mockMetaElement = {
	getAttribute: jest.fn(() => "mock-csrf-token"),
}

jest.spyOn(document, "querySelector").mockImplementation((selector) => {
	if (selector === 'meta[name="csrf-token"]') {
		return mockMetaElement
	}
	return null
})

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useParams: jest.fn(),
	useNavigate: jest.fn(),
}))

// Mock the MenuItemList component
jest.mock("../menu-item/MenuItemList", () => {
	return ({ menuId, menuItems, onUpdateMenuItems }) => (
		<div data-testid="mock-menu-item-list">
			<span data-testid="menu-id">{menuId}</span>
			<span data-testid="menu-items-count">{menuItems.length}</span>
			<button
				data-testid="update-menu-items-button"
				onClick={() =>
					onUpdateMenuItems([
						...menuItems,
						{ id: 999, name: "New Item", price: 5.99 },
					])
				}
			>
				Add Item
			</button>
		</div>
	)
})

import MenuInfo from "./MenuInfo"
import * as api from "../../services/apiService"

jest.mock("../../services/apiService", () => ({
	fetchMenu: jest.fn(),
	deleteMenu: jest.fn(),
}))

describe("MenuInfo Component", () => {
	const mockMenu = {
		id: 1,
		name: "Lunch Menu",
		menu_items: [{ id: 1, name: "Hamburger", price: 10.99 }],
	}

	const mockNavigate = jest.fn()

	beforeEach(() => {
		jest.resetAllMocks()
		jest.clearAllMocks()

		// Ensure the default mocks
		api.fetchMenu.mockResolvedValue(mockMenu)
		useParams.mockReturnValue({ menuId: "1", restaurantId: "123" })
		require("react-router-dom").useNavigate.mockReturnValue(mockNavigate)
	})

	it("renders loading state initially", () => {
		// Keeps the loading state
		api.fetchMenu.mockImplementation(() => new Promise(() => {}))

		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		expect(screen.getByTestId("loading")).toBeInTheDocument()
	})

	it("renders menu details after successful fetch", async () => {
		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		expect(screen.getByTestId("menu-name")).toBeInTheDocument()
		expect(screen.getByText("Lunch Menu")).toBeInTheDocument()
		expect(screen.getByTestId("back-button")).toBeInTheDocument()
		expect(screen.getByTestId("edit-button")).toBeInTheDocument()
	})

	it("renders error message if menu fetch fails", async () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})
		api.fetchMenu.mockRejectedValue(new Error("Failed to load menu details"))

		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
		})

		expect(screen.getByText("Failed to load menu details")).toBeInTheDocument()
	})

	it("renders no menu found message when menu is null", async () => {
		api.fetchMenu.mockResolvedValue(null)

		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.getByTestId("no-menu")).toBeInTheDocument()
		})

		expect(screen.getByText("Menu not found")).toBeInTheDocument()
	})

	it("navigates to menus page after successful delete", async () => {
		api.deleteMenu.mockResolvedValue({})
		jest.spyOn(window, "confirm").mockReturnValue(true)

		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		const deleteButton = screen.getByTestId("delete-button")
		fireEvent.click(deleteButton)

		await waitFor(() => {
			expect(api.deleteMenu).toHaveBeenCalledWith("123", "1")
			expect(mockNavigate).toHaveBeenCalledWith("/restaurants/123/menus")
		})

		window.confirm.mockRestore()
	})

	it("shows error when delete fails", async () => {
		api.deleteMenu.mockRejectedValue(new Error("Failed to delete menu"))
		jest.spyOn(window, "confirm").mockReturnValue(true)

		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		const deleteButton = screen.getByTestId("delete-button")
		fireEvent.click(deleteButton)

		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
			expect(screen.getByText("Failed to delete menu")).toBeInTheDocument()
		})

		window.confirm.mockRestore()
	})

	it("does not delete menu if user cancels confirmation", async () => {
		jest.spyOn(window, "confirm").mockReturnValue(false)

		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		const deleteButton = screen.getByTestId("delete-button")
		fireEvent.click(deleteButton)

		expect(api.deleteMenu).not.toHaveBeenCalled()
		expect(mockNavigate).not.toHaveBeenCalled()

		window.confirm.mockRestore()
	})

	// MenuItemList integration tests
	it("renders the MenuItemList component with correct props", async () => {
		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		// Check if MenuItemList is rendered
		expect(screen.getByTestId("mock-menu-item-list")).toBeInTheDocument()

		// Check if correct props are passed
		expect(screen.getByTestId("menu-id").textContent).toBe("1")
		expect(screen.getByTestId("menu-items-count").textContent).toBe("1")
	})

	it("renders MenuItemList with empty array when menu has no menu_items", async () => {
		api.fetchMenu.mockResolvedValue({
			id: 1,
			name: "Lunch Menu",
			menu_items: null,
		})

		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		// Check if MenuItemList is rendered with empty array
		expect(screen.getByTestId("menu-items-count").textContent).toBe("0")
	})

	it("updates menu items when updateMenuItems function is called", async () => {
		renderWithRoute(
			<MenuInfo />,
			"/restaurants/123/menus/1",
			"/restaurants/:restaurantId/menus/:menuId"
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		// Simulate adding a new menu item through the mock component
		fireEvent.click(screen.getByTestId("update-menu-items-button"))

		// Check if menu state is updated with the new item
		await waitFor(() => {
			// After the update, the MenuItemList should be re-rendered with updated props
			// Our mock shows the count of menu items, which should now be 2
			expect(screen.getByTestId("menu-items-count").textContent).toBe("2")
		})
	})
})
