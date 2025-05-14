import React, { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { fetchMenus, deleteMenu } from "../../services/apiService"

function MenuList() {
	const { restaurantId } = useParams()
	const [menus, setMenus] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const getMenus = async () => {
			try {
				setLoading(true)
				const data = await fetchMenus()
				setMenus(data)
				setLoading(false)
			} catch (error) {
				setError("Failed to load menus")
				setLoading(false)
			}
		}

		getMenus()
	}, [])

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this menu?")) {
			try {
				await deleteMenu(id)
				setMenus(menus.filter((menu) => menu.id !== id))
			} catch (error) {
				setError("Failed to delete menu")
			}
		}
	}

	if (loading) {
		return (
			<div className="text-center mt-5" data-testid="loading">
				<div className="spinner-border"></div>
			</div>
		)
	}

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2>Menus</h2>
				<Link
					to="/menus/new"
					className="btn btn-primary"
					data-testid="create-menu-btn"
				>
					Add Menu
				</Link>
			</div>

			{/* Display error message if `error` state is not null */}
			{error && (
				<div className="alert alert-danger mb-4" data-testid="error">
					{error}
				</div>
			)}

			{menus.length === 0 ? (
				<div className="alert alert-info" data-testid="no-menus">
					No menus available. Create one to get started!
				</div>
			) : (
				<div className="row" data-testid="menu-list">
					{menus.map((menu) => (
						<div
							className="col-md-6 col-lg-4 mb-4"
							key={menu.id}
							data-testid={`menu-item-menu.id`}
						>
							<div className="card h-100">
								<div className="card-body">
									<h5 className="card-title">{menu.name}</h5>
									<p className="card-text text-muted">
										{menu.menu_items?.length || 0} items
									</p>
								</div>
								<div className="card-footer bg-white border-top-0">
									<Link
										to={`/restaurants/${restaurantId}/menus/${menu.id}`}
										className="btn btn-info me-2"
										data-testid={`view-menu-${menu.id}`}
									>
										View
									</Link>
									<Link
										to={`/restaurants/${restaurantId}/menus/${menu.id}/edit`}
										className="btn btn-secondary me-2"
										data-testid={`edit-menu-${menu.id}`}
									>
										Edit
									</Link>
									<button
										onClick={() => handleDelete(menu.id)}
										className="btn btn-danger"
										data-testid={`delete-menu-${menu.id}`}
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default MenuList
