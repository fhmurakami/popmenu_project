import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./shared/Navbar"
import MenuList from "./menu/MenuList"
import MenuInfo from "./menu/MenuInfo"
import MenuForm from "./menu/MenuForm"
import RestaurantList from "./restaurant/RestaurantList"
import RestaurantForm from "./restaurant/RestaurantForm"
import RestaurantInfo from "./restaurant/RestaurantInfo"

const App = () => {
	return (
		<Router>
			<div className="App min-h-screen bg-gray-100">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<Routes>
						{/* Restaurant routes */}
						<Route path="/" element={<RestaurantList />} />
						<Route path="/restaurants" element={<RestaurantList />} />
						<Route path="/restaurants/new" element={<RestaurantForm />} />
						<Route
							path="/restaurants/:restaurantId"
							element={<RestaurantInfo />}
						/>
						<Route
							path="/restaurants/:restaurantId/edit"
							element={<RestaurantForm />}
						/>

						{/* Menu routes */}
						<Route
							path="/restaurants/:restaurantId/menus"
							element={<MenuList />}
						/>
						<Route
							path="/restaurants/:restaurantId/menus/new"
							element={<MenuForm />}
						/>
						<Route
							path="/restaurants/:restaurantId/menus/:menuId"
							element={<MenuInfo />}
						/>
						<Route
							path="/restaurants/:restaurantId/menus/:menuId/edit"
							element={<MenuForm />}
						/>

						{/* Fallback route */}
						<Route
							path="*"
							element={
								<div>
									<h1>404 Not Found</h1>
									<p>The page you are looking for does not exist.</p>
								</div>
							}
						/>
					</Routes>
				</div>
			</div>
		</Router>
	)
}

export default App
