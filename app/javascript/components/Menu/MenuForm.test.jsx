import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
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
	useParams: jest.fn(),
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
	const mockMenu = {
		id: 1,
		name: "Lunch Menu",
	}

	const mockNavigate = jest.fn()

	beforeEach(() => {
		jest.resetAllMocks()
		jest.clearAllMocks()

		api.fetchMenu.mockResolvedValue(mockMenu)
		api.createMenu.mockResolvedValue({})
		api.updateMenu.mockResolvedValue({})
		require("react-router-dom").useNavigate.mockReturnValue(mockNavigate)
	})

	test("renders create form by default", () => {
		require("react-router-dom").useParams.mockReturnValue({})

		render(
			<Router>
				<MenuForm />
			</Router>
		)

		expect(screen.getByTestId("form-title")).toHaveTextContent("Create New Menu")
		expect(screen.getByTestId("menu-name-input")).toHaveValue("")
		expect(screen.getByTestId("submit-button")).toHaveTextContent("Create Menu")
	})

	test("renders edit form and loads menu data when id is provided", async () => {
		require("react-router-dom").useParams.mockReturnValue({ id: "1" })

		render(
			<Router>
				<MenuForm />
			</Router>
		)

		expect(screen.getByTestId("loading")).toBeInTheDocument()

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		expect(screen.getByTestId("form-title")).toHaveTextContent("Edit Menu")
		expect(screen.getByTestId("menu-name-input")).toHaveValue("Lunch Menu")
		expect(screen.getByTestId("submit-button")).toHaveTextContent("Update Menu")
	})

	test("shows error when menu fetch fails in edit mode", async () => {
		require("react-router-dom").useParams.mockReturnValue({ id: "1" })
		api.fetchMenu.mockRejectedValue(new Error("Failed to load menu"))

		render(
			<Router>
				<MenuForm />
			</Router>
		)

		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
		})

		expect(screen.getByText("Failed to load menu")).toBeInTheDocument()
	})

	test("updates form data when user types in input field", () => {
		require("react-router-dom").useParams.mockReturnValue({})

		render(
			<Router>
				<MenuForm />
			</Router>
		)

		const input = screen.getByTestId("menu-name-input")
		fireEvent.change(input, { target: { value: "New Test Menu" } })

		expect(input).toHaveValue("New Test Menu")
	})

	test("submits form and creates new menu", async () => {
		require("react-router-dom").useParams.mockReturnValue({})

		render(
			<Router>
				<MenuForm />
			</Router>
		)

		const input = screen.getByTestId("menu-name-input")
		fireEvent.change(input, { target: { value: "New Test Menu" } })

		const form = screen.getByTestId("menu-form")
		fireEvent.submit(form)

		expect(api.createMenu).toHaveBeenCalledWith({ name: "New Test Menu" })

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/menus")
		})
	})

	test("submits form and updates existing menu", async () => {
		require("react-router-dom").useParams.mockReturnValue({ id: "1" })

		render(
			<Router>
				<MenuForm />
			</Router>
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		const input = screen.getByTestId("menu-name-input")
		fireEvent.change(input, { target: { value: "Updated Menu Name" } })

		const form = screen.getByTestId("menu-form")
		fireEvent.submit(form)

		expect(api.updateMenu).toHaveBeenCalledWith("1", { name: "Updated Menu Name" })

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/menus")
		})
	})

	test("shows error when create menu fails", async () => {
		require("react-router-dom").useParams.mockReturnValue({})
		api.createMenu.mockRejectedValue(new Error("Failed to create menu"))

		render(
			<Router>
				<MenuForm />
			</Router>
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

	test("shows error when update menu fails", async () => {
		require("react-router-dom").useParams.mockReturnValue({ id: "1" })
		api.updateMenu.mockRejectedValue(new Error("Failed to update menu"))

		render(
			<Router>
				<MenuForm />
			</Router>
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		const form = screen.getByTestId("menu-form")
		fireEvent.submit(form)

		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
		})

		expect(screen.getByText("Failed to update menu")).toBeInTheDocument()
	})

	test("navigates back to menus when cancel button is clicked", () => {
		require("react-router-dom").useParams.mockReturnValue({})

		render(
			<Router>
				<MenuForm />
			</Router>
		)

		const cancelButton = screen.getByTestId("cancel-button")
		fireEvent.click(cancelButton)

		expect(mockNavigate).toHaveBeenCalledWith("/menus")
	})
})
