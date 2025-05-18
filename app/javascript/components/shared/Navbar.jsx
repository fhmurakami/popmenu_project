import React from "react"
import { Link } from "react-router-dom"

const Navbar = () => {
	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark text-white">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<div className="ml-10 flex items-baseline space-x-4">
							<Link
								to="/restaurants"
								className="px-3 py-2 rounded-md hover:bg-gray-700"
							>
								Restaurants
							</Link>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
