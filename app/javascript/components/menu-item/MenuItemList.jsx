import React, { useState } from "react"
import { deleteMenuItem } from "../../services/apiService"
import MenuItemForm from "./MenuItemForm"

function MenuItemList({
	restaurantId,
	menuId,
	menuItems,
	onUpdateMenuItems,
	readOnly = false,
}) {
	const [showAddItem, setShowAddItem] = useState(false)
	const [error, setError] = useState(null)

	const handleDeleteMenuItem = async (itemId) => {
		if (window.confirm("Are you sure you want to delete this item?")) {
			try {
				await deleteMenuItem(restaurantId, menuId, itemId)
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
		<div className={readOnly ? "" : "card mb-4"}>
			{!readOnly && (
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
			)}

			{error && !readOnly && (
				<div className="alert alert-danger m-3" data-testid="error">
					{error}
				</div>
			)}

			{showAddItem && !readOnly && (
				<div className="card-body border-bottom">
					<MenuItemForm
						restaurantId={restaurantId}
						menuId={menuId}
						onSave={handleAddMenuItem}
					/>
				</div>
			)}

			<div className="list-group list-group-flush" data-testid="menu-item-list">
				{menuItems.length > 0 ? (
					menuItems.map((item) => (
						<div
							className={
								readOnly
									? "list-group-item d-flex justify-content-between flex-column align-items-start py-3"
									: "list-group-item"
							}
							key={item.id}
							data-testid={`menu-item-${item.id}`}
						>
							<div className="d-flex justify-content-between w-100">
								<span>{item.name}</span>
								<span>
									{Intl.NumberFormat("en-US", {
										style: "currency",
										currency: "USD",
									}).format(item.price)}
								</span>
							</div>
							{item.description && (
								<small className="text-muted mt-1">{item.description}</small>
							)}
							{item.ingredients && (
								<>
									<small className="text-muted mt-1.5">
										<b>Ingredients:</b>
									</small>
									<small className="text-muted mt-0.5">
										{item.ingredients}
									</small>
								</>
							)}
							{item.dietary_restrictions && (
								<small className="text-muted mt-1">
									{item.dietary_restrictions == "None" ? (
										""
									) : (
										<span>
											<strong>Dietary Restrictions: </strong>
											<em>{`${item.dietary_restrictions}`}</em>
										</span>
									)}
								</small>
							)}
							{!readOnly && (
								<div className="mt-2">
									<button
										onClick={() => handleDeleteMenuItem(item.id)}
										className="btn btn-ouline-danger btn-sm"
										data-testid={`delete-item-${item.id}`}
									>
										Remove
									</button>
								</div>
							)}
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
