import React from "react"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithRoute } from "../../tests/testUtils"
import "@testing-library/jest-dom"

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

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: jest.fn(),
}))

import RestaurantForm from "./RestaurantForm"
import * as apiService from "../../services/apiService"

// Mock the apiService module
jest.mock("../../services/apiService", () => ({
	fetchRestaurant: jest.fn(),
	createRestaurant: jest.fn(),
	updateRestaurant: jest.fn(),
}))

describe("RestaurantForm", () => {
	const mockNavigate = jest.fn()

	beforeEach(() => {
		jest.clearAllMocks()
		mockNavigate.mockClear()
		require("react-router-dom").useNavigate.mockReturnValue(mockNavigate)
	})

	it("renders create form with initial values", () => {
		renderWithRoute(<RestaurantForm />, "/restaurants/new", "/restaurants/new")

		expect(screen.getByTestId("form-title")).toHaveTextContent(
			"Create New Restaurant"
		)
		expect(screen.getByTestId("restaurant-name-input").value).toBe("")
		expect(screen.getByTestId("submit-button")).toHaveTextContent(
			"Create Restaurant"
		)
	})

	it("validates empty name field", async () => {
		renderWithRoute(<RestaurantForm />, "/restaurants/new", "/restaurants/new")

		// Clear the input value to trigger validation
		const nameInput = screen.getByTestId("restaurant-name-input")
		fireEvent.change(nameInput, { target: { value: "" } })

		fireEvent.submit(screen.getByTestId("restaurant-form"))

		await waitFor(() => {
			expect(screen.getByTestId("error")).toHaveTextContent(
				"Restaurant name is required"
			)
		})
	})

	it("submits form and redirects on create", async () => {
		// Mock the createRestaurant function
		apiService.createRestaurant.mockResolvedValueOnce({ id: 123 })

		renderWithRoute(<RestaurantForm />, "/restaurants/new", "/restaurants/new")

		fireEvent.change(screen.getByTestId("restaurant-name-input"), {
			target: { value: "Sushi Place" },
		})

		fireEvent.submit(screen.getByTestId("restaurant-form"))

		await waitFor(() => {
			expect(apiService.createRestaurant).toHaveBeenCalledWith({
				name: "Sushi Place",
			})
			expect(mockNavigate).toHaveBeenCalledWith("/restaurants/123")
		})
	})

	it("shows error message if create fails", async () => {
		// Mock the createRestaurant function to throw an error
		apiService.createRestaurant.mockRejectedValueOnce("Failed to create")

		renderWithRoute(<RestaurantForm />, "/restaurants/new", "/restaurants/new")

		fireEvent.change(screen.getByTestId("restaurant-name-input"), {
			target: { value: "Invalid" },
		})
		fireEvent.submit(screen.getByTestId("restaurant-form"))

		await waitFor(() => {
			expect(screen.getByTestId("error")).toHaveTextContent(
				"Failed to create restaurant"
			)
		})
	})

	it("renders edit form and populates data", async () => {
		// Mock the fetchRestaurant function
		apiService.fetchRestaurant.mockResolvedValueOnce({ name: "Sushi Master" })

		renderWithRoute(
			<RestaurantForm isEditing={true} />,
			"/restaurants/1/edit",
			"/restaurants/:id/edit"
		)

		expect(screen.getByTestId("loading")).toBeInTheDocument()

		await waitFor(() => {
			expect(screen.getByTestId("restaurant-name-input").value).toBe(
				"Sushi Master"
			)
		})
		expect(screen.getByTestId("submit-button")).toHaveTextContent(
			"Update Restaurant"
		)
	})

	it("shows error if fetch restaurant fails", async () => {
		// Mock the fetchRestaurant function to throw an error
		apiService.fetchRestaurant.mockRejectedValueOnce(new Error("Network Error"))

		renderWithRoute(
			<RestaurantForm isEditing={true} />,
			"/restaurants/1/edit",
			"/restaurants/:id/edit"
		)

		await waitFor(() => {
			expect(screen.getByTestId("error")).toHaveTextContent(
				"Failed to load restaurant"
			)
		})
	})

	it("submits form and redirects on update", async () => {
		// Mock the fetchRestaurant and updateRestaurant functions
		apiService.fetchRestaurant.mockResolvedValueOnce({ name: "Old Name" })
		apiService.updateRestaurant.mockResolvedValueOnce({})

		renderWithRoute(
			<RestaurantForm isEditing={true} />,
			"/restaurants/1/edit",
			"/restaurants/:id/edit"
		)

		await waitFor(() => {
			expect(screen.getByTestId("restaurant-name-input").value).toBe("Old Name")
		})

		fireEvent.change(screen.getByTestId("restaurant-name-input"), {
			target: { value: "New Name" },
		})
		fireEvent.submit(screen.getByTestId("restaurant-form"))

		await waitFor(() => {
			expect(apiService.updateRestaurant).toHaveBeenCalledWith("1", {
				name: "New Name",
			})
			expect(mockNavigate).toHaveBeenCalledWith("/restaurants/1")
		})
	})

	it("shows error if update fails", async () => {
		// Mock the fetchRestaurant function and updateRestaurant to throw an error
		apiService.fetchRestaurant.mockResolvedValueOnce({ name: "To Update" })
		apiService.updateRestaurant.mockRejectedValueOnce("Update failed")

		renderWithRoute(
			<RestaurantForm isEditing={true} />,
			"/restaurants/1/edit",
			"/restaurants/:id/edit"
		)

		await waitFor(() => {
			expect(screen.getByTestId("restaurant-name-input").value).toBe(
				"To Update"
			)
		})

		fireEvent.submit(screen.getByTestId("restaurant-form"))

		await waitFor(() => {
			expect(screen.getByTestId("error")).toHaveTextContent(
				"Failed to update restaurant"
			)
		})
	})

	it("navigates back when clicking cancel button", () => {
		renderWithRoute(<RestaurantForm />, "/restaurants/new", "/restaurants/new")

		fireEvent.click(screen.getByTestId("cancel-button"))
		expect(mockNavigate).toHaveBeenCalledWith("/restaurants")
	})

	it("navigates to correct location when clicking cancel in edit mode", async () => {
		apiService.fetchRestaurant.mockResolvedValueOnce({
			name: "Test Restaurant",
		})

		renderWithRoute(
			<RestaurantForm isEditing={true} />,
			"/restaurants/1/edit",
			"/restaurants/:id/edit"
		)

		await waitFor(() => {
			expect(screen.getByTestId("restaurant-name-input").value).toBe(
				"Test Restaurant"
			)
		})

		fireEvent.click(screen.getByTestId("cancel-button"))
		expect(mockNavigate).toHaveBeenCalledWith("/restaurants/1")
	})
})
