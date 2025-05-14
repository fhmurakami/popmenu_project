import React, { useState } from "react"
import { deleteMenuItem } from "../../services/apiService"
import MenuItemForm from "./MenuItemForm"

function MenuItemList({ menuId, menuItems, onUpdateMenuItems }) {
	const [showAddItem, setShowAddItem] = useState(false)
	const [error, setError] = useState(null)

	const handleDeleteMenuItem = async (itemId) => {
		if (window.confirm("Are you sure you want to delete this item?")) {
			try {
				await deleteMenuItem(menuId, itemId)
				const updatedItems = menuItems.filter((item) => item.id !== itemId)
				onUpdateMenuItems(updatedItems)
			} catch (error) {
				setError("Failed to delete menu item")
			}
		}
	}

	const handleAddMenuItem = (newItem) => {
		const updatedItems = [...menuItems, newItem]
		onUpdateMenuItems(updatedItems)
		setShowAddItem(false)
	}

	return (
		<div className="card mb-4">
			<div className="card-header d-flex justify-content-between align-items-center">
				<h5 className="mb-0">Menu Items</h5>
				<button
					className="btn btn-primary btn-sm"
					onClick={() => setShowAddItem(!showAddItem)}
					data-testid="toggle-add-item"
				>
					{showAddItem ? "Cancel" : "Add Item"}
				</button>
			</div>

			{error && (
				<div className="alert alert-danger m-3" data-testid="error">
					{error}
				</div>
			)}

			{showAddItem && (
				<div className="card-body border-bottom">
					<MenuItemForm menuId={menuId} onSave={handleAddMenuItem} />
				</div>
			)}

			<div className="list-group list-group-flush" data-testid="menu-item-list">
				{menuItems.length > 0 ? (
					menuItems.map((item) => (
						<div
							className="list-group-item"
							key={item.id}
							data-testid={`menu-item-${item.id}`}
						>
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="mb-0" data-testid={`item-name-${item.id}`}>
										{item.name}
									</h6>
									<small
										className="text-muted"
										data-testid={`item-price-${item.id}`}
									>
										{Intl.NumberFormat("en-US", {
											style: "currency",
											currency: "USD",
										}).format(item.price)}
									</small>
								</div>
								<div>
									<button
										onClick={() => handleDeleteMenuItem(item.id)}
										className="btn btn-ouline-danger btn-sm"
										data-testid={`delete-item-${item.id}`}
									>
										Remove
									</button>
								</div>
							</div>
						</div>
					))
				) : (
					<div
						className="list-group-item text-center text-muted"
						data-testid="no-items"
					>
						No items in this menu
					</div>
				)}
			</div>
		</div>
	)
}

export default MenuItemList
