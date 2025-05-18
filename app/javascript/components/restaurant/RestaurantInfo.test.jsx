import React from "react"
import { screen, waitFor, fireEvent } from "@testing-library/react"
import { renderWithRoute } from "../../tests/testUtils"

// Mock de MenuItemList
jest.mock("../menu-item/MenuItemList", () => () => (
	<div data-testid="mock-menu-item-list" />
))

// Mock de CSRF Token
const mockMetaElement = {
	getAttribute: jest.fn((attr) => {
		if (attr === "name") return "mock-csrf-token"
		return null
	}),
}
jest.spyOn(document, "querySelector").mockImplementation((selector) => {
	if (selector === 'meta[name="csrf-token"]') return mockMetaElement
	return null
})

import RestaurantInfo from "./RestaurantInfo"
import * as api from "../../services/apiService"

// Mock das funções da API
jest.mock("../../services/apiService", () => ({
	fetchRestaurant: jest.fn(),
	deleteRestaurant: jest.fn(),
}))

describe("RestaurantInfo", () => {
	const mockRestaurant = {
		id: 1,
		name: "Tasty Bites",
		address: "123 Street",
		phone: "123-456",
		website: "www.tastybites.com",
		description: "Delicious food",
		menus: [
			{
				id: 1,
				name: "Lunch Menu",
				menu_items: [],
			},
		],
	}

	beforeEach(() => {
		jest.clearAllMocks()
		confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true)
		jest.mock("react-router-dom", () => {
			const mockNavigate = jest.fn()
			return {
				...jest.requireActual("react-router-dom"),
				useNavigate: () => mockNavigate,
			}
		})
	})

	test("displays loading while fetching", async () => {
		api.fetchRestaurant.mockReturnValue(new Promise(() => {}))
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		expect(screen.getByTestId("loading")).toBeInTheDocument()
	})

	test("displays error when fetch fails", async () => {
		api.fetchRestaurant.mockRejectedValue(new Error("API Error"))
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => {
			expect(screen.getByTestId("error")).toHaveTextContent("API Error")
		})
	})

	test("displays message when restaurant is not found", async () => {
		api.fetchRestaurant.mockResolvedValue(null)
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => {
			expect(screen.getByTestId("no-restaurant")).toBeInTheDocument()
		})
	})

	test("displays restaurant data and menus", async () => {
		api.fetchRestaurant.mockResolvedValue(mockRestaurant)
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => {
			expect(screen.getByText("Tasty Bites")).toBeInTheDocument()
			expect(screen.getByText("123 Street")).toBeInTheDocument()
			expect(screen.getByText("123-456")).toBeInTheDocument()
			expect(screen.getByText("www.tastybites.com")).toBeInTheDocument()
			expect(screen.getByText("Delicious food")).toBeInTheDocument()
			expect(screen.getByText("Lunch Menu")).toBeInTheDocument()
			expect(screen.getByTestId("mock-menu-item-list")).toBeInTheDocument()
		})
	})

	test("displays alert if restaurant has no menus", async () => {
		const restaurantWithoutMenus = { ...mockRestaurant, menus: [] }
		api.fetchRestaurant.mockResolvedValue(restaurantWithoutMenus)
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => {
			expect(
				screen.getByText("This restaurant doesn't have any menus yet.")
			).toBeInTheDocument()
		})
	})

	test("navigates to edit restaurant page on Edit click", async () => {
		api.fetchRestaurant.mockResolvedValue(mockRestaurant)
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => {
			expect(screen.getByText("Edit")).toBeInTheDocument()
		})
		expect(screen.getByText("Edit").getAttribute("href")).toBe(
			"/restaurants/1/edit"
		)
	})

	test("navigates to new menu creation page", async () => {
		api.fetchRestaurant.mockResolvedValue(mockRestaurant)
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => {
			expect(screen.getByText("Add Menu")).toBeInTheDocument()
		})
		expect(screen.getByText("Add Menu").getAttribute("href")).toBe(
			"/restaurants/1/menus/new"
		)
	})

	test("deletes restaurant when confirmed", async () => {
		api.fetchRestaurant.mockResolvedValue(mockRestaurant)
		api.deleteRestaurant.mockResolvedValue({})
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => screen.getByText("Delete"))
		fireEvent.click(screen.getByText("Delete"))
		await waitFor(() => {
			expect(api.deleteRestaurant).toHaveBeenCalledWith("1")
		})
	})

	test("displays error when deletion fails", async () => {
		api.fetchRestaurant.mockResolvedValue(mockRestaurant)
		api.deleteRestaurant.mockRejectedValue(new Error("Delete failed"))
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => screen.getByText("Delete"))
		fireEvent.click(screen.getByText("Delete"))
		await waitFor(() => {
			expect(screen.getByTestId("error")).toHaveTextContent(
				"Failed to delete restaurant"
			)
		})
	})

	test("does not delete if confirmation is rejected", async () => {
		confirmSpy.mockReturnValue(false)
		api.fetchRestaurant.mockResolvedValue(mockRestaurant)
		renderWithRoute(
			<RestaurantInfo />,
			"/restaurants/1",
			"/restaurants/:restaurantId"
		)
		await waitFor(() => screen.getByText("Delete"))
		fireEvent.click(screen.getByText("Delete"))
		await waitFor(() => {
			expect(api.deleteRestaurant).not.toHaveBeenCalled()
		})
	})
})
