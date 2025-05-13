import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./Navbar"
import MenuList from "./Menu/MenuList"
import MenuDetail from "./Menu/MenuDetail"
import MenuForm from "./Menu/MenuForm"

const App = () => {
	return (
		<Router>
			<div className="App min-h-screen bg-gray-100">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<Routes>
						<Route path="/" element={<MenuList />} />
						<Route path="/menus" element={<MenuList />} />
						<Route path="/menus/new" element={<MenuForm />} />
						<Route path="/menus/:id" element={<MenuDetail />} />
						<Route path="/menus/:id/edit" element={<MenuForm />} />
					</Routes>
				</div>
			</div>
		</Router>
	)
}

export default App
