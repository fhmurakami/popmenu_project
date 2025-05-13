import { render, screen } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
import "@testing-library/jest-dom"
import Navbar from "./Navbar"

describe("Navbar Component", () => {
	test("renders navbar with menu link", () => {
		render(
			<Router>
				<Navbar />
			</Router>
		)

		const menuLink = screen.getByText("Menus")
		expect(menuLink).toBeInTheDocument()
		expect(menuLink.getAttribute("href")).toBe("/menus")
	})
})
