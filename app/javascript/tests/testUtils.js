import { render } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"

/**
 * Helper to render a component with React Router context and dynamic route
 *
 * @param {ReactElement} ui - The component to render
 * @param {string} route - The initial route (ex: "/restaurants/123/menus/1")
 * @param {string} path - The route pattern (ex: "/restaurants/:restaurantId/menus/:menuId")
 */
export const renderWithRoute = (ui, route, path) => {
	return render(
		<MemoryRouter initialEntries={[route]}>
			<Routes>
				<Route path={path} element={ui} />
			</Routes>
		</MemoryRouter>
	)
}

// api.fetchMenu.mockResolvedValue(mockMenu)
// api.createMenu.mockResolvedValue({})
// api.updateMenu.mockResolvedValue({})
// require("react-router-dom").useNavigate.mockReturnValue(mockNavigate)
