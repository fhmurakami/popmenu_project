import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchMenu, createMenu, updateMenu } from "../../services/apiService"

function MenuForm() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [formData, setFormData] = useState({ name: "" })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const isEditing = !!id

	useEffect(() => {
		if (isEditing) {
			const getMenu = async () => {
				try {
					setLoading(true)
					const data = await fetchMenu(id)
					setFormData({ name: data.name })
					setLoading(false)
				} catch (error) {
					setError("Failed to load menu")
					setLoading(false)
				}
			}

			getMenu()
		}
	}, [id, isEditing])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData({ ...formData, [name]: value })
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			setLoading(true)

			if (isEditing) {
				await updateMenu(id, formData)
			} else {
				await createMenu(formData)
			}

			navigate("/menus")
		} catch (error) {
			setError(`Failed to ${isEditing ? "update" : "create"} menu`)
			setLoading(false)
		}
	}

	if (loading && isEditing) {
		return (
			<div className="text-center mt-5" data-testid="loading">
				<div className="spinner-border"></div>
			</div>
		)
	}

	return (
		<div className="card">
			<div className="card-header">
				<h3 data-testid="form-title">{isEditing ? "Edit Menu" : "Create New Menu"}</h3>
			</div>
			<div className="card-body">
				{error && (
					<div className="alert alert-danger" data-testid="error">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} data-testid="menu-form">
					<div className="mb-3">
						<label htmlFor="name" className="form-label">
							Menu Name
						</label>
						<input
							type="text"
							className="form-control"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							data-testid="menu-name-input"
						/>
					</div>

					<div className="d-flex justify-content-between">
						<button
							type="button"
							className="btn btn-outline-secondary"
							onClick={() => navigate("/menus")}
							data-testid="cancel-button"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
							data-testid="submit-button"
						>
							{loading ? (
								<>
									<span className="spinner-border spinner-border-sm me-2"></span>
									Saving...
								</>
							) : isEditing ? (
								"Update Menu"
							) : (
								"Create Menu"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default MenuForm
