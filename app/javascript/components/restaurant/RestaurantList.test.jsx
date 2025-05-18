import React from "react"
import { screen, waitFor, fireEvent } from "@testing-library/react"
import { renderWithRoute } from "../../tests/testUtils"

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

import RestaurantList from "./RestaurantList"
import * as api from "../../services/apiService"
import { spyOn } from "jest-mock"

jest.mock("../../services/apiService", () => ({
	fetchRestaurants: jest.fn(),
	deleteRestaurant: jest.fn(),
}))

describe("RestaurantList", () => {
	const mockRestaurants = [
		{
			id: 2,
			name: "Food Palace",
			menus: [],
		},
		{
			id: 3,
			name: "Solo Diner",
			menus: [{ id: 3 }],
		},
		{
			id: 1,
			name: "Tasty Bites",
			menus: [{ id: 1 }, { id: 2 }],
		},
	]

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test("displays loading indicator", async () => {
		api.fetchRestaurants.mockReturnValue(new Promise(() => {})) // never resolves

		renderWithRoute(<RestaurantList />, "/", "/")

		expect(screen.getByTestId("loading")).toBeInTheDocument()
	})

	test("displays error if fetch fails", async () => {
		api.fetchRestaurants.mockRejectedValue(new Error("API Error"))

		renderWithRoute(<RestaurantList />, "/", "/")

		await waitFor(() => {
			expect(screen.getByTestId("error")).toHaveTextContent("API Error")
		})

		api.fetchRestaurants.mockRestore()
	})

	test("displays no restaurants message", async () => {
		api.fetchRestaurants.mockResolvedValue([])

		renderWithRoute(<RestaurantList />, "/", "/")

		await waitFor(() => {
			expect(screen.getByTestId("no-restaurants")).toBeInTheDocument()
		})
	})

	test("displays list of restaurants", async () => {
		api.fetchRestaurants.mockResolvedValue(mockRestaurants)

		renderWithRoute(<RestaurantList />, "/", "/")

		await waitFor(() => {
			expect(screen.getByTestId("restaurant-list")).toBeInTheDocument()
		})

		mockRestaurants.forEach((restaurant) => {
			expect(
				screen.getByTestId(`restaurant-${restaurant.id}`)
			).toBeInTheDocument()
			expect(
				screen.getByTestId(`view-restaurant-${restaurant.id}`)
			).toBeInTheDocument()
			expect(
				screen.getByTestId(`edit-restaurant-${restaurant.id}`)
			).toBeInTheDocument()
			expect(
				screen.getByTestId(`delete-restaurant-${restaurant.id}`)
			).toBeInTheDocument()
		})

		expect(screen.getByText("2 menus available")).toBeInTheDocument()
		expect(screen.getByText("0 menus available")).toBeInTheDocument()
		expect(screen.getByText("1 menu available")).toBeInTheDocument()
	})

	test("clicking Add Restaurant navigates to creation route", async () => {
		api.fetchRestaurants.mockResolvedValue([])

		renderWithRoute(<RestaurantList />, "/", "/")

		await waitFor(() => {
			expect(screen.getByTestId("create-restaurant-btn")).toBeInTheDocument()
		})

		expect(
			screen.getByTestId("create-restaurant-btn").getAttribute("href")
		).toBe("/restaurants/new")
	})

	test("handles deleteRestaurant logic with confirm", async () => {
		// Setup
		api.fetchRestaurants.mockResolvedValue(mockRestaurants)
		api.deleteRestaurant.mockResolvedValue({})
		jest.spyOn(window, "confirm").mockReturnValue(true)

		renderWithRoute(<RestaurantList />, "/", "/")

		await waitFor(() => {
			expect(screen.getByTestId("restaurant-list")).toBeInTheDocument()
			expect(screen.queryByText("Tasty Bites")).toBeInTheDocument()
		})

		const deleteButton = screen.getByTestId("delete-restaurant-1")
		fireEvent.click(deleteButton)

		await waitFor(() => {
			expect(screen.queryByText("Tasty Bites")).not.toBeInTheDocument()
			expect(api.deleteRestaurant).toHaveBeenCalledWith(1)
		})
	})

	test("cancels delete if confirm is rejected", async () => {
		api.fetchRestaurants.mockResolvedValue(mockRestaurants)
		api.deleteRestaurant.mockClear()
		const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false)

		renderWithRoute(<RestaurantList />, "/", "/")

		await waitFor(() => {
			expect(screen.getByTestId("restaurant-list")).toBeInTheDocument()
		})

		fireEvent.click(screen.getByTestId("delete-restaurant-1"))

		await waitFor(() => {
			expect(api.deleteRestaurant).not.toHaveBeenCalled()
		})

		confirmSpy.mockRestore()
	})

	test("displays error on delete failure", async () => {
		api.fetchRestaurants.mockResolvedValue(mockRestaurants)
		api.deleteRestaurant.mockRejectedValue(new Error("Delete failed"))
		spyOn(window, "confirm").mockReturnValue(true)

		renderWithRoute(<RestaurantList />, "/", "/")

		await waitFor(() => {
			expect(screen.getByTestId("restaurant-list")).toBeInTheDocument()
		})

		fireEvent.click(screen.getByTestId("delete-restaurant-1"))

		await waitFor(() => {
			expect(screen.getByTestId("error")).toHaveTextContent(
				"Failed to delete restaurant"
			)
		})
	})
})
