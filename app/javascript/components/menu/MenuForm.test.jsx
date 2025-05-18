import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithRoute } from "../../tests/testUtils"
import { act } from "react"
import "@testing-library/jest-dom"

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
	useNavigate: jest.fn(),
}))

import MenuForm from "./MenuForm"
import * as api from "../../services/apiService"

jest.mock("../../services/apiService", () => ({
	fetchMenu: jest.fn(),
	createMenu: jest.fn(),
	updateMenu: jest.fn(),
}))

describe("MenuForm Component", () => {
	const restaurantId = 123
	const mockMenu = {
		id: 1,
		name: "Lunch Menu",
	}

	const mockNavigate = jest.fn()

	beforeEach(() => {
		jest.clearAllMocks()
		mockNavigate.mockClear()
		require("react-router-dom").useNavigate.mockReturnValue(mockNavigate)
	})

	describe("Form Rendering", () => {
		test("renders create form by default", () => {
			renderWithRoute(
				<MenuForm />,
				`/restaurants/${restaurantId}/menus/new`,
				"/restaurants/:restaurantId/menus/new"
			)

			expect(screen.getByTestId("form-title")).toHaveTextContent(
				"Create New Menu"
			)
			expect(screen.getByTestId("menu-name-input")).toHaveValue("")
			expect(screen.getByTestId("submit-button")).toHaveTextContent(
				"Create Menu"
			)
		})

		test("renders edit form and loads menu data when menuId is provided", async () => {
			api.fetchMenu.mockResolvedValue(mockMenu)

			await act(async () => {
				renderWithRoute(
					<MenuForm />,
					`/restaurants/${restaurantId}/menus/1/edit`,
					"/restaurants/:restaurantId/menus/:menuId/edit"
				)
			})

			expect(await screen.findByDisplayValue("Lunch Menu")).toBeInTheDocument()
			expect(screen.getByTestId("form-title")).toHaveTextContent("Edit Menu")
			expect(screen.getByTestId("menu-name-input")).toHaveValue("Lunch Menu")
			expect(screen.getByTestId("submit-button")).toHaveTextContent(
				"Update Menu"
			)
		})
	})

	describe("Form Interactions", () => {
		test("updates form data when user types in input field", () => {
			renderWithRoute(
				<MenuForm />,
				`/restaurants/${restaurantId}/menus/new`,
				"/restaurants/:restaurantId/menus/new"
			)

			const input = screen.getByTestId("menu-name-input")
			fireEvent.change(input, { target: { value: "New Test Menu" } })

			expect(input).toHaveValue("New Test Menu")
		})

		test("navigates back to menus when cancel button is clicked", () => {
			require("react-router-dom").useNavigate.mockReturnValue(mockNavigate)

			renderWithRoute(
				<MenuForm />,
				`/restaurants/${restaurantId}/menus/new`,
				"/restaurants/:restaurantId/menus/new"
			)

			const cancelButton = screen.getByTestId("cancel-button")
			fireEvent.click(cancelButton)

			expect(mockNavigate).toHaveBeenCalledWith(
				`/restaurants/${restaurantId}/menus`
			)
		})
	})

	describe("Create Menu Operations", () => {
		test("submits form and creates new menu", async () => {
			require("react-router-dom").useNavigate.mockReturnValue(mockNavigate)
			api.createMenu.mockResolvedValue({ id: 111 })

			renderWithRoute(
				<MenuForm />,
				`/restaurants/${restaurantId}/menus/new`,
				"/restaurants/:restaurantId/menus/new"
			)

			const input = screen.getByTestId("menu-name-input")
			fireEvent.change(input, { target: { value: "New Test Menu" } })
			fireEvent.click(screen.getByTestId("submit-button"))

			expect(api.createMenu).toHaveBeenCalledWith("123", {
				name: "New Test Menu",
			})

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith(
					`/restaurants/${restaurantId}/menus`
				)
			})
		})

		test("shows error if menu name is empty", async () => {
			renderWithRoute(
				<MenuForm />,
				`/restaurants/${restaurantId}/menus/new`,
				"/restaurants/:restaurantId/menus/new"
			)

			const form = screen.getByTestId("menu-form")
			fireEvent.submit(form)

			await waitFor(() => {
				expect(screen.getByTestId("error")).toBeInTheDocument()
			})

			expect(screen.getByText("Menu name is required")).toBeInTheDocument()
		})

		test("shows error when create menu fails", async () => {
			api.createMenu.mockRejectedValue(new Error("Failed to create menu"))

			renderWithRoute(
				<MenuForm />,
				`/restaurants/${restaurantId}/menus/new`,
				"/restaurants/:restaurantId/menus/new"
			)

			const input = screen.getByTestId("menu-name-input")
			fireEvent.change(input, { target: { value: "New Test Menu" } })

			const form = screen.getByTestId("menu-form")
			fireEvent.submit(form)

			await waitFor(() => {
				expect(screen.getByTestId("error")).toBeInTheDocument()
			})

			expect(screen.getByText("Failed to create menu")).toBeInTheDocument()
		})

		test("shows loading spinner on submit in create mode", async () => {
			let resolveCreate
			const createPromise = new Promise((resolve) => {
				resolveCreate = resolve
			})
			api.createMenu.mockReturnValue(createPromise)

			renderWithRoute(
				<MenuForm />,
				`/restaurants/${restaurantId}/menus/new`,
				"/restaurants/:restaurantId/menus/new"
			)

			fireEvent.change(screen.getByTestId("menu-name-input"), {
				target: { value: "Creating..." },
			})

			fireEvent.submit(screen.getByTestId("menu-form"))

			expect(screen.getByTestId("submit-button")).toBeDisabled()
			expect(screen.getByText("Saving...")).toBeInTheDocument()

			await act(async () => {
				resolveCreate({ id: 222, name: "Creating..." })
			})

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith(
					`/restaurants/${restaurantId}/menus`
				)
			})
		})
	})

	describe("Edit Menu Operations", () => {
		test("submits form and updates existing menu", async () => {
			api.fetchMenu.mockResolvedValue(mockMenu)
			api.updateMenu.mockResolvedValue({})

			await act(async () => {
				renderWithRoute(
					<MenuForm />,
					`/restaurants/${restaurantId}/menus/${mockMenu.id}/edit`,
					"/restaurants/:restaurantId/menus/:menuId/edit"
				)
			})

			await waitFor(() => {
				expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
				expect(screen.getByTestId("menu-name-input")).toHaveValue(mockMenu.name)
			})

			const input = screen.getByTestId("menu-name-input")
			fireEvent.change(input, { target: { value: "Updated Menu Name" } })
			fireEvent.click(screen.getByTestId("submit-button"))

			expect(api.updateMenu).toHaveBeenCalledWith(
				restaurantId.toString(),
				mockMenu.id.toString(),
				{
					name: "Updated Menu Name",
				}
			)

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith(
					`/restaurants/${restaurantId}/menus`
				)
			})
		})

		test("shows error when menu fetch fails in edit mode", async () => {
			api.fetchMenu.mockRejectedValue(new Error("Failed to load menu"))

			await act(async () => {
				renderWithRoute(
					<MenuForm />,
					`/restaurants/${restaurantId}/menus/1/edit`,
					"/restaurants/:restaurantId/menus/:menuId/edit"
				)
			})

			await waitFor(() => {
				expect(screen.getByTestId("error")).toBeInTheDocument()
			})

			expect(screen.getByText("Failed to load menu")).toBeInTheDocument()
		})

		test("shows error when update menu fails", async () => {
			api.fetchMenu.mockResolvedValue(mockMenu)
			api.updateMenu.mockRejectedValue(new Error("Failed to update menu"))

			await act(async () => {
				renderWithRoute(
					<MenuForm />,
					`/restaurants/${restaurantId}/menus/${mockMenu.id}/edit`,
					"/restaurants/:restaurantId/menus/:menuId/edit"
				)
			})

			await waitFor(() => {
				expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
			})

			fireEvent.change(screen.getByTestId("menu-name-input"), {
				target: { value: "Updated Menu Name" },
			})
			fireEvent.click(screen.getByTestId("submit-button"))

			await waitFor(() => {
				expect(screen.getByTestId("error")).toBeInTheDocument()
			})

			expect(screen.getByText("Failed to update menu")).toBeInTheDocument()
		})

		test("disables submit button while loading in edit mode", async () => {
			// Mock a slow API call
			let resolveUpdatePromise
			const updatePromise = new Promise((resolve) => {
				resolveUpdatePromise = resolve
			})
			api.updateMenu.mockReturnValue(updatePromise)
			api.fetchMenu.mockResolvedValue(mockMenu)

			await act(async () => {
				renderWithRoute(
					<MenuForm />,
					`/restaurants/${restaurantId}/menus/${mockMenu.id}/edit`,
					"/restaurants/:restaurantId/menus/:menuId/edit"
				)
			})

			await waitFor(() => {
				expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
			})

			const submitButton = await screen.findByTestId("submit-button")
			expect(submitButton).not.toBeDisabled()

			fireEvent.click(submitButton)

			await waitFor(() => {
				expect(screen.getByTestId("submit-button")).toBeDisabled()
				expect(screen.getByText("Saving...")).toBeInTheDocument()
			})

			await act(async () => {
				resolveUpdatePromise({ id: 111, name: "Test Updated Menu" })
			})

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith(
					`/restaurants/${restaurantId}/menus`
				)
			})
		})
	})
})
