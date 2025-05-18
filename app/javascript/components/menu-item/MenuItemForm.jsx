import React, { useState } from "react"
import { createMenuItem } from "../../services/apiService"

function MenuItemForm({ restaurantId, menuId, onSave }) {
	const [formData, setFormData] = useState({
		name: "",
		price: "",
		menu_id: menuId,
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const handleChange = (e) => {
		const value =
			e.target.name === "price"
				? parseFloat(e.target.value) || ""
				: e.target.value

		setFormData({ ...formData, [e.target.name]: value })
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!menuId) {
			setError("Menu Item should be associated with a Menu")
			return
		}

		if (!formData.name || !formData.price) {
			setError("Please fill out all required fields")
			return
		}

		try {
			setLoading(true)
			const newItem = await createMenuItem(restaurantId, menuId, formData)
			setFormData({ name: "", price: "", menu_id: menuId })
			setLoading(false)
			setError(null)
			onSave(newItem)
		} catch (error) {
			setError("Failed to add menu item")
			setLoading(false)
		}
	}

	return (
		<>
			<h6 className="mb-3">Add Menu Item</h6>
			{error && (
				<div className="alert alert-danger" data-testid="error">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} data-testid="menu-item-form">
				<div className="row g-3">
					<div className="col-md-6">
						<label htmlFor="name" className="form-label">
							Item
						</label>
						<input
							type="text"
							className="form-control"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							data-testid="item-name-input"
						/>
					</div>
					<div className="col-md-6">
						<label htmlFor="price" className="form-label">
							Price
						</label>
						<input
							type="number"
							step="0.01"
							min="0"
							className="form-control"
							id="price"
							name="price"
							value={formData.price}
							onChange={handleChange}
							required
							data-testid="item-price-input"
						/>
					</div>
				</div>

				<div className="mt-3 text-end">
					<button
						type="submit"
						className="btn btn-success"
						disabled={loading}
						data-testid="add-item-button"
					>
						{loading ? (
							<>
								<span className="spinner-border spinner-border-sm me-2"></span>
								Adding...
							</>
						) : (
							"Add Item"
						)}
					</button>
				</div>
			</form>
		</>
	)
}

export default MenuItemForm
