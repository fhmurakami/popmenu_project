import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import App from "./App"

// Mock child components to isolate App's rendering and routing
jest.mock("./shared/Navbar", () => {
	return () => <div data-testid="mock-navbar">Navbar</div>
})
jest.mock("./menu/MenuList", () => {
	return () => <div data-testid="mock-menu-list">MenuList</div>
})
jest.mock("./menu/MenuInfo", () => {
	return () => <div data-testid="mock-menu-detail">MenuInfo</div>
})
jest.mock("./menu/MenuForm", () => {
	return () => <div data-testid="mock-menu-form">MenuForm</div>
})
jest.mock("./restaurant/RestaurantList", () => {
	return () => <div data-testid="mock-restaurant-index">RestaurantList</div>
})
jest.mock("./restaurant/RestaurantInfo", () => {
	return () => <div data-testid="mock-restaurant-show">RestaurantInfo</div>
})
jest.mock("./restaurant/RestaurantForm", () => {
	return () => <div data-testid="mock-restaurant-form">RestaurantForm</div>
})

describe("App Component", () => {
	// Clear the browser history before each test
	beforeEach(() => {
		window.history.pushState({}, "", "/")
	})

	test("renders Navbar and RestaurantsIndex on the home route", () => {
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-restaurant-index")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-restaurant-form")).not.toBeInTheDocument()
	})

	test("renders RestaurantList on the /restaurants route", () => {
		window.history.pushState({}, "Test page", "/restaurants")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-restaurant-index")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-restaurant-form")).not.toBeInTheDocument()
	})

	test("renders RestaurantInfo on the /restaurants/:restaurantId route", () => {
		window.history.pushState({}, "Test page", "/restaurants/1")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-restaurant-show")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-restaurant-form")).not.toBeInTheDocument()
	})

	test("renders RestaurantForm on the /restaurants/new route", () => {
		window.history.pushState({}, "Test page", "/restaurants/new")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-restaurant-form")).toBeInTheDocument()
		expect(
			screen.queryByTestId("mock-restaurant-index")
		).not.toBeInTheDocument()
	})

	test("renders RestaurantForm on the /restaurants/:id/edit route", () => {
		window.history.pushState({}, "Test page", "/restaurants/1/edit")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-restaurant-form")).toBeInTheDocument()
		expect(
			screen.queryByTestId("mock-restaurant-index")
		).not.toBeInTheDocument()
	})

	test("renders MenuList on the /menus route", () => {
		window.history.pushState({}, "Test page", "/restaurants/1/menus")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-menu-list")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-menu-form")).not.toBeInTheDocument()
	})

	test("renders MenuForm on the /menus/new route", () => {
		window.history.pushState({}, "Test page", "/restaurants/1/menus/new")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-menu-form")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-menu-list")).not.toBeInTheDocument()
	})

	test("renders MenuForm on the /menus/:id/edit route", () => {
		window.history.pushState({}, "Test page", "/restaurants/1/menus/1/edit")
		render(<App />)
		expect(screen.getByTestId("mock-navbar")).toBeInTheDocument()
		expect(screen.getByTestId("mock-menu-form")).toBeInTheDocument()
		expect(screen.queryByTestId("mock-menu-list")).not.toBeInTheDocument()
	})

	test("renders fallback page for unknown routes", () => {
		window.history.pushState({}, "Test page", "/unknown")
		render(<App />)
		expect(screen.getByText("404 Not Found")).toBeInTheDocument()
		expect(
			screen.getByText("The page you are looking for does not exist.")
		).toBeInTheDocument()
	})
})
