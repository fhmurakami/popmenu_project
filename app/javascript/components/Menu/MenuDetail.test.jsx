import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
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

import MenuDetail from "./MenuDetail"
import * as api from "../../services/apiService"

jest.mock("../../services/apiService", () => ({
	fetchMenu: jest.fn(),
	deleteMenu: jest.fn(),
}))

describe("MenuDetail Component", () => {
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
		require("react-router-dom").useParams.mockReturnValue({ id: "1" })
		require("react-router-dom").useNavigate.mockReturnValue(mockNavigate)
	})

	it("renders loading state initially", () => {
		// Keeps the loading state
		api.fetchMenu.mockImplementation(() => new Promise(() => {}))

		render(
			<Router>
				<MenuDetail />
			</Router>
		)

		expect(screen.getByTestId("loading")).toBeInTheDocument()
	})

	it("renders menu details after successful fetch", async () => {
		render(
			<Router>
				<MenuDetail />
			</Router>
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
		api.fetchMenu.mockRejectedValue(new Error("Failed to load menu details"))

		render(
			<Router>
				<MenuDetail />
			</Router>
		)

		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
		})

		expect(screen.getByText("Failed to load menu details")).toBeInTheDocument()
	})

	it("renders no menu found message when menu is null", async () => {
		api.fetchMenu.mockResolvedValue(null)

		render(
			<Router>
				<MenuDetail />
			</Router>
		)

		await waitFor(() => {
			expect(screen.getByTestId("no-menu")).toBeInTheDocument()
		})

		expect(screen.getByText("Menu not found")).toBeInTheDocument()
	})

	it("navigates to menus page after successful delete", async () => {
		api.deleteMenu.mockResolvedValue({})
		jest.spyOn(window, "confirm").mockReturnValue(true)

		render(
			<Router>
				<MenuDetail />
			</Router>
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		// O problema é que o data-testeid tem um typo no arquivo original (data-testeid vs data-testid)
		// Vamos resolver isso procurando pelo texto do botão
		const deleteButton = screen.getByTestId("delete-button")
		fireEvent.click(deleteButton)

		await waitFor(() => {
			expect(api.deleteMenu).toHaveBeenCalledWith("1")
			expect(mockNavigate).toHaveBeenCalledWith("/menus")
		})

		window.confirm.mockRestore()
	})

	it("shows error when delete fails", async () => {
		api.deleteMenu.mockRejectedValue(new Error("Failed to delete menu"))
		jest.spyOn(window, "confirm").mockReturnValue(true)

		render(
			<Router>
				<MenuDetail />
			</Router>
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		const deleteButton = screen.getByText("Delete Menu")
		fireEvent.click(deleteButton)

		await waitFor(() => {
			expect(screen.getByTestId("error")).toBeInTheDocument()
			expect(screen.getByText("Failed to delete menu")).toBeInTheDocument()
		})

		window.confirm.mockRestore()
	})

	it("does not delete menu if user cancels confirmation", async () => {
		jest.spyOn(window, "confirm").mockReturnValue(false)

		render(
			<Router>
				<MenuDetail />
			</Router>
		)

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
		})

		const deleteButton = screen.getByText("Delete Menu")
		fireEvent.click(deleteButton)

		expect(api.deleteMenu).not.toHaveBeenCalled()
		expect(mockNavigate).not.toHaveBeenCalled()

		window.confirm.mockRestore()
	})
})
