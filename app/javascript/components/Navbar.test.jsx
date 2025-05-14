import { render, screen } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
import "@testing-library/jest-dom"
import Navbar from "./Navbar"

describe("Navbar Component", () => {
	test("renders navbar with restaurants and menus links", () => {
		render(
			<Router>
				<Navbar />
			</Router>
		)

		const restaurantLink = screen.getByText("Restaurants")

		expect(restaurantLink).toBeInTheDocument()
		expect(restaurantLink.getAttribute("href")).toBe("/restaurants")
	})
})
