import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import App from "./App"

// Mock child components to isolate App's rendering and routing
jest.mock("./Navbar", () => {
	return () => <div data-testid="mock-navbar">Navbar</div>
})
jest.mock("./Menu/MenuList", () => {
	return () => <div data-testid="mock-menu-list">MenuList</div>
})
jest.mock("./Menu/MenuDetail", () => {
	return () => <div data-testid="mock-menu-list">MenuDetail</div>
})
jest.mock("./Menu/MenuForm", () => {
	return () => <div data-testid="mock-menu-form">MenuForm</div>
})

describe("App Component", () => {
	// Clear the browser history before each test
	beforeEach(() => {
		window.history.pushState({}, "", "/")
	})

	test("renders Navbar and MenuList on the home route", () => {
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-menu-list")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-menu-form")).not.toBeInTheDocument()
	})

	test("renders MenuForm on the /menus/new route", () => {
		window.history.pushState({}, "Test page", "/menus/new")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-menu-form")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-menu-list")).not.toBeInTheDocument()
	})

	test("renders MenuList on the /menus route", () => {
		window.history.pushState({}, "Test page", "/menus")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-menu-list")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-menu-form")).not.toBeInTheDocument()
	})

	test("renders MenuForm on the /menus/:id/edit route", () => {
		window.history.pushState({}, "Test page", "/menus/1/edit")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-menu-form")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-menu-list")).not.toBeInTheDocument()
	})
})
