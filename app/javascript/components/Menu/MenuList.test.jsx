import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
import "@testing-library/jest-dom"

// Mock the DOM for CSRF Token before importing apiService
// This needs to happen at the module level before any imports that rely on it
// We are directly defining a mock implementation for querySelector
const mockMetaElement = {
	getAttribute: jest.fn((attr) => {
		if (attr === "name") {
			return "mock-csrf-token"
		}
		return null
	}),
}

// Spy on document.querySelector and make it return our mock element
// when it's called with "meta[name="csrf-token"]"
jest.spyOn(document, "querySelector").mockImplementation((selector) => {
	if (selector === 'meta[name="csrf-token"]') {
		return mockMetaElement
	}
	// Call the original implementation for other queries,
	// or return null if only want to mock this specific case
	// jest.requireActual("jsdom").JSDOM.fromHTML("").window.document.querySelector(selector)
	return null
})

import MenuList from "./MenuList"
import * as api from "../../services/apiService"

// Mock apiService functions
jest.mock("../../services/apiService", () => ({
	fetchMenus: jest.fn(),
	deleteMenu: jest.fn(),
}))

describe("MenuList Component", () => {
	// Sample menu data for testing
	const mockMenus = [
		{ id: 1, name: "Lunch Menu", menu_items: [] },
		{ id: 2, name: "Dinner Menu", menu_items: [{ id: 1, name: "Pizza", price: 10.99 }] },
	]

	beforeEach(() => {
		// Reset all mocks before each test
		jest.resetAllMocks()

		// Ensure the default mock for fetchMenus is set if not handled in specific tests
		api.fetchMenus.mockResolvedValue(mockMenus) // Default mock for successful fetch
	})

	// Restore the original implementation after all tests are done
	afterAll(() => {
		jest.restoreAllMocks()
	})

	it("renders loading state initially", () => {
		// Keeps the loading state
		api.fetchMenus.mockImplementation(() => new Promise(() => {}))

		render(
			<Router>
				<MenuList />
			</Router>
		)

		expect(screen.getByTestId("loading")).toBeInTheDocument()
	})

	it("renders menus after successful fetch", async () => {
		render(
			<Router>
				<MenuList />
			</Router>
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})
		expect(screen.getByTestId("menu-list")).toBeInTheDocument()
		expect(screen.getByText("Lunch Menu")).toBeInTheDocument()
		expect(screen.getByText("Dinner Menu")).toBeInTheDocument()
	})

	it("renders error message if menu fetch fails", async () => {
		api.fetchMenus.mockRejectedValue(new Error("Faild to load menus"))

		render(
			<Router>
				<MenuList />
			</Router>
		)

		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
		})

		expect(screen.getByText("Failed to load menus")).toBeInTheDocument()
	})

	it("does not delete menu if user cancels confirmation", async () => {
		// Ensure delete is not called
		api.deleteMenu.mockRejectedValue(new Error("Should not be called"))
		jest.spyOn(window, "confirm").mockReturnValue(false)

		render(
			<Router>
				<MenuList />
			</Router>
		)

		await waitFor(() => {
			expect(screen.getByText("Lunch Menu")).toBeInTheDocument()
		})

		fireEvent.click(screen.getByTestId("delete-menu-1"))

		// Wait for any potential async operations related to confirmation to settle
		await waitFor(() => {
			expect(api.deleteMenu).not.toHaveBeenCalled()
		})

		expect(screen.getByText("Lunch Menu")).toBeInTheDocument()
		expect(screen.getByText("Dinner Menu")).toBeInTheDocument()

		window.confirm.mockRestore()
	})

	it("handles menu deletion", async () => {
		api.deleteMenu.mockResolvedValue({})
		// Mock user confirmation
		jest.spyOn(window, "confirm").mockReturnValue(true)

		render(
			<Router>
				<MenuList />
			</Router>
		)

		await waitFor(() => {
			expect(screen.queryByText("Lunch Menu")).toBeInTheDocument()
		})

		fireEvent.click(screen.getByTestId("delete-menu-1"))

		await waitFor(() => {
			expect(screen.queryByText("Lunch Menu")).not.toBeInTheDocument()
		})

		expect(screen.getByText("Dinner Menu")).toBeInTheDocument()

		// Restore original confirm
		window.confirm.mockRestore()
	})

	it("displays error message if menu deletion fails and menu is not removed", async () => {
		const errorMessage = "Failed to delete menu"
		api.deleteMenu.mockRejectedValue(new Error(errorMessage))
		jest.spyOn(window, "confirm").mockReturnValue(true)

		render(
			<Router>
				<MenuList />
			</Router>
		)

		await waitFor(() => {
			expect(screen.queryByText("Lunch Menu")).toBeInTheDocument()
			expect(screen.queryByText("Dinner Menu")).toBeInTheDocument()
		})

		fireEvent.click(screen.getByTestId("delete-menu-1"))

		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
		})

		expect(screen.getByText(errorMessage)).toBeInTheDocument()
		expect(screen.getByText("Lunch Menu")).toBeInTheDocument()
		expect(screen.getByText("Dinner Menu")).toBeInTheDocument()

		window.confirm.mockRestore()
	})
})
