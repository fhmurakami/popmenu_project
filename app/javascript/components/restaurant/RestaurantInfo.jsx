import React, { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { fetchRestaurant, deleteRestaurant } from "../../services/apiService"
import MenuItemList from "../menu-item/MenuItemList"

function RestaurantInfo() {
	const { restaurantId } = useParams()
	const navigate = useNavigate()
	const [restaurant, setRestaurant] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const loadRestaurant = async () => {
			try {
				const data = await fetchRestaurant(restaurantId)

				setRestaurant(data)
			} catch (err) {
				console.error("Error fetching restaurant:", err)
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}
		loadRestaurant()
	}, [restaurantId])

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this restaurant?")) {
			try {
				await deleteRestaurant(restaurantId)
				navigate("/restaurants")
			} catch (err) {
				console.error("Error deleting restaurant:", err)
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

	if (error) {
		return (
			<div className="alert alert-danger" data-testid="error">
				{error}
			</div>
		)
	}

	if (!restaurant) {
		return (
			<div className="alert alert-warning" data-testid="no-restaurant">
				Restaurant not found
			</div>
		)
	}

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2 className="fw-bold">{restaurant.name}</h2>
				<div>
					<Link
						to={`/restaurants/${restaurantId}/edit`}
						className="btn btn-secondary me-2"
					>
						Edit
					</Link>
					<button onClick={handleDelete} className="btn btn-danger">
						Delete
					</button>
				</div>
			</div>

			<div className="mb-4">
				<p className="mb-1">
					<strong>Address:</strong> {restaurant.address}
				</p>
				<p className="mb-1">
					<strong>Phone:</strong> {restaurant.phone}
				</p>
				<p className="mb-1">
					<strong>Website:</strong> {restaurant.website}
				</p>
				<p>
					<strong>Description:</strong> {restaurant.description}
				</p>
			</div>

			<hr className="my-4" />

			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="fw-semibold">Menus</h4>
				<Link
					to={`/restaurants/${restaurantId}/menus/new`}
					className="btn btn-primary"
				>
					Add Menu
				</Link>
			</div>

			{restaurant.menus.length === 0 ? (
				<div className="alert alert-info">
					This restaurant doesn't have any menus yet.
				</div>
			) : (
				<div className="row">
					{restaurant.menus.map((menu) => (
						<div className="col-12 mb-4" key={menu.id}>
							<div className="card h-100">
								<div className="card-body">
									<h5 className="card-title">{menu.name}</h5>

									<MenuItemList
										restaurantId={restaurantId}
										menuId={menu.id}
										menuItems={menu.menu_items}
										readOnly={true}
									/>
								</div>
								<div className="card-footer bg-white border-top-0">
									<Link
										to={`/restaurants/${restaurantId}/menus/${menu.id}/edit`}
										className="btn btn-info me-2"
									>
										Edit Menu
									</Link>
									<Link
										to={`/restaurants/${restaurantId}/menus/${menu.id}/menu_items/new`}
										className="btn btn-secondary"
									>
										Add Menu Item
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default RestaurantInfo
