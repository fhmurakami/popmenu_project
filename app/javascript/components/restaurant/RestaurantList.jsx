import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { fetchRestaurants, deleteRestaurant } from "../../services/apiService"

function RestaurantIndex() {
	const [restaurants, setRestaurants] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const loadRestaurants = async () => {
			try {
				const data = await fetchRestaurants()
				setRestaurants(data)
			} catch (err) {
				console.error("Error fetching restaurants:", err)
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}
		loadRestaurants()
	}, [])

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this restaurant?")) {
			try {
				await deleteRestaurant(id)
				setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id))
				setError(null)
			} catch (error) {
				console.error("Error deleting restaurant:", error)
				setError("Failed to delete restaurant")
			}
		}
	}

	if (loading) {
		return (
			<div className="text-center mt-5" data-testid="loading">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		)
	}

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2>Restaurants</h2>
				<Link
					to="/restaurants/new"
					className="btn btn-primary"
					data-testid="create-restaurant-btn"
				>
					Add Restaurant
				</Link>
			</div>

			{error && (
				<div className="alert alert-danger mb-4" data-testid="error">
					{error}
				</div>
			)}

			{restaurants.length === 0 ? (
				<div className="alert alert-info" data-testid="no-restaurants">
					No restaurants found. Add one to get started!
				</div>
			) : (
				<div className="row" data-testid="restaurant-list">
					{restaurants.map((restaurant) => (
						<div
							className="col-md-6 col-lg-4 mb-4"
							key={restaurant.id}
							data-testid={`restaurant-${restaurant.id}`}
						>
							<div className="card h-100">
								<div className="card-body">
									<h5 className="card-title">{restaurant.name}</h5>
									<p className="card-text text-muted">
										{restaurant.menus?.length || 0}{" "}
										{restaurant.menus?.length === 1 ? "menu" : "menus"}{" "}
										available
									</p>
								</div>
								<div className="card-footer bg-white border-top-0">
									<Link
										to={`/restaurants/${restaurant.id}`}
										className="btn btn-info me-2"
										data-testid={`view-restaurant-${restaurant.id}`}
									>
										View
									</Link>
									<Link
										to={`/restaurants/${restaurant.id}/edit`}
										className="btn btn-secondary me-2"
										data-testid={`edit-restaurant-${restaurant.id}`}
									>
										Edit
									</Link>
									<button
										onClick={() => handleDelete(restaurant.id)}
										className="btn btn-danger"
										data-testid={`delete-restaurant-${restaurant.id}`}
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

export default RestaurantIndex
