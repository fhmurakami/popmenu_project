// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import React from "react"
import { createRoot } from "react-dom/client"
import App from "./components/App"

document.addEventListener("DOMContentLoaded", () => {
	const container = document.getElementById("react-app")
	if (container) {
		const root = createRoot(container)
		root.render(<App />)
	}
})
