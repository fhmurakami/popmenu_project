import React, { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { fetchMenu, deleteMenu } from "../../services/apiService"
import MenuItemList from "../MenuItem/MenuItemList"

function MenuDetail() {
	const { menuId, restaurantId } = useParams()
	const navigate = useNavigate()
	const [menu, setMenu] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const getMenu = async () => {
			try {
				setLoading(true)
				const data = await fetchMenu(restaurantId, menuId)
				setMenu(data)
				setLoading(false)
			} catch (error) {
				console.error("Error fetching menu details:", error)
				setError("Failed to load menu details")
				setLoading(false)
			}
		}

		getMenu()
	}, [menuId, restaurantId])

	const handleDeleteMenu = async () => {
		if (window.confirm("Are you sure you want to delete this menu?")) {
			try {
				await deleteMenu(restaurantId, menuId)
				navigate("/restaurants/" + restaurantId + "/menus")
			} catch (error) {
				setError("Failed to delete menu")
			}
		}
	}

	// Function to update menu items in state after a successful add/delete
	const updateMenuItems = (updatedMenuItems) => {
		setMenu({
			...menu,
			menu_items: updatedMenuItems,
		})
	}

	if (loading) {
		return (
			<div className="text-center mt-5" data-testid="loading">
				<div className="spinner-border"></div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="alert alert-danger" data-testid="error">
				{error}
			</div>
		)
	}

	if (!menu) {
		return (
			<div className="alert alert-warning" data-testid="no-menu">
				Menu not found
			</div>
		)
	}

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2 data-testid="menu-name">{menu.name}</h2>
				<div>
					<Link
						to={`/restaurants/${restaurantId}/menus`}
						className="btn btn-outline-secondary me-2"
						data-testid="back-button"
					>
						Back to Menus
					</Link>
					<Link
						to={`/restaurants/${restaurantId}/menus/${menuId}/edit`}
						className="btn btn-secondary me-2"
						data-testid="edit-button"
					>
						Edit Menu
					</Link>
					<button
						onClick={handleDeleteMenu}
						className="btn btn-danger"
						data-testid="delete-button"
					>
						Delete Menu
					</button>
				</div>
			</div>

			{/* Use the MenuItemList component to display/manage menu items */}
			<MenuItemList
				restaurantId={restaurantId}
				menuId={menu.id}
				menuItems={menu.menu_items || []}
				onUpdateMenuItems={updateMenuItems}
			/>
		</div>
	)
}

export default MenuDetail
