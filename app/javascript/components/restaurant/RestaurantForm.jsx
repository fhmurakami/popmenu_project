import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
	fetchRestaurant,
	createRestaurant,
	updateRestaurant,
} from "../../services/apiService"

const RestaurantForm = ({ isEditing = false }) => {
	const navigate = useNavigate()
	const { id } = useParams()
	const [formData, setFormData] = useState({
		name: "",
	})
	const [loading, setLoading] = useState(isEditing)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (isEditing) {
			const loadRestaurant = async () => {
				try {
					setLoading(true)
					const data = await fetchRestaurant(id)
					setFormData({ name: data.name })
					setLoading(false)
				} catch (error) {
					setError("Failed to load restaurant")
					setLoading(false)
				}
			}

			loadRestaurant()
		}
	}, [id, isEditing])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value,
		})
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!formData.name || formData.name.trim() === "") {
			setError("Restaurant name is required")
			return
		}

		try {
			setLoading(true)
			if (isEditing) {
				await updateRestaurant(id, formData)
				navigate(`/restaurants/${id}`)
			} else {
				const data = await createRestaurant(formData)
				navigate(`/restaurants/${data.id}`)
			}
		} catch (error) {
			setError(`Failed to ${isEditing ? "update" : "create"} restaurant`)
			setLoading(false)
		}
	}

	if (loading && isEditing && !formData.name) {
		return (
			<div className="text-center mt-5" data-testid="loading">
				<div className="spinner-border"></div>
			</div>
		)
	}

	return (
		<div className="card">
			<div className="card-header">
				<h3 data-testid="form-title">
					{isEditing ? "Edit Restaurant" : "Create New Restaurant"}
				</h3>
			</div>
			<div className="card-body">
				{error && (
					<div className="alert alert-danger" data-testid="error">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} data-testid="restaurant-form">
					<div className="mb-3">
						<label htmlFor="name" className="form-label">
							Restaurant Name
						</label>
						<input
							type="text"
							className="form-control"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							data-testid="restaurant-name-input"
						/>
					</div>

					<div className="d-flex justify-content-between">
						<button
							type="button"
							className="btn btn-outline-secondary"
							onClick={() =>
								navigate(isEditing ? `/restaurants/${id}` : "/restaurants")
							}
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
								"Update Restaurant"
							) : (
								"Create Restaurant"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default RestaurantForm
