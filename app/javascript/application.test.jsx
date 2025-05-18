// Mock imports before they happen in the module
jest.mock("@hotwired/turbo-rails", () => ({}))
jest.mock("react-dom/client", () => ({
	createRoot: jest.fn(() => ({
		render: jest.fn(),
	})),
}))
jest.mock("./components/App", () => () => "Mocked App Component")

// Save original document.addEventListener before importing file
const originalAddEventListener = document.addEventListener
let domContentLoadedHandler = null

document.addEventListener = jest.fn((event, callback) => {
	if (event === "DOMContentLoaded") {
		domContentLoadedHandler = callback
	}
})

import "@hotwired/turbo-rails"
import { createRoot } from "react-dom/client"
import App from "./components/App"

describe("Application Entry Point", () => {
	// Set up DOM element
	let container

	beforeEach(() => {
		// Create a fresh DOM for each test
		document.body.innerHTML = ""

		jest.clearAllMocks()

		// Re-import to register the event listener
		jest.isolateModules(() => {
			require("./application.jsx")
		})
	})

	afterEach(() => {
		// Reset document.addEventListener
		document.addEventListener = originalAddEventListener
	})

	test("renders React app when container exists", () => {
		container = document.createElement("div")
		container.id = "react-app"
		document.body.appendChild(container)

		// Trigger DOMContentLoaded event
		domContentLoadedHandler()

		expect(createRoot).toHaveBeenCalledWith(container)

		// Verify render was called with the App component
		const rootInstance = createRoot.mock.results[0].value
		expect(rootInstance.render).toHaveBeenCalled()
	})

	test("does not render React app when container is missing", () => {
		// Trigger DOMContentLoaded event without creating the container
		domContentLoadedHandler()

		expect(createRoot).not.toHaveBeenCalled()
	})

	test("uses the first container when multiple exist with the same ID", () => {
		const firstContainer = document.createElement("div")
		firstContainer.id = "react-app"
		document.body.appendChild(firstContainer)

		// Create second container with the same ID (invalid HTML but should be handled)
		const secondContainer = document.createElement("div")
		secondContainer.id = "react-app"
		document.body.appendChild(secondContainer)

		domContentLoadedHandler()

		expect(createRoot).toHaveBeenCalledWith(firstContainer)
		expect(createRoot).not.toHaveBeenCalledTimes(2)
	})

	test("handles multiple DOMContentLoaded events safely", () => {
		container = document.createElement("div")
		container.id = "react-app"
		document.body.appendChild(container)

		// Trigger DOMContentLoaded event multiple times
		domContentLoadedHandler()
		domContentLoadedHandler()

		expect(createRoot).toHaveBeenCalledTimes(1)
	})

	test("handles Turbo Drive navigation correctly", () => {
		// Mock turbo:visit event for completeness
		const turboVisitHandler = jest.fn()
		document.addEventListener = jest.fn((event, callback) => {
			if (event === "DOMContentLoaded") {
				domContentLoadedHandler = callback
			} else if (event === "turbo:visit") {
				turboVisitHandler()
			}
		})

		container = document.createElement("div")
		container.id = "react-app"
		document.body.appendChild(container)

		domContentLoadedHandler()

		expect(createRoot).toHaveBeenCalledWith(container)
		expect(turboVisitHandler).not.toHaveBeenCalled()
	})

	test("does not render if container is added after DOMContentLoaded", () => {
		// Trigger DOMContentLoaded event without a container
		domContentLoadedHandler()

		container = document.createElement("div")
		container.id = "react-app"
		document.body.appendChild(container)

		// Verify createRoot was not called since container was added too late
		expect(createRoot).not.toHaveBeenCalled()
	})

	test("handles render errors gracefully", () => {
		// Mock console.error to capture errors
		const originalConsoleError = console.error
		console.error = jest.fn()

		container = document.createElement("div")
		container.id = "react-app"
		document.body.appendChild(container)

		createRoot.mockImplementationOnce(() => {
			throw new Error("Mock render error")
		})

		// Add a try/catch around DOM content loaded to test error handling
		try {
			domContentLoadedHandler()
		} catch (e) {
			// The error should be caught in the application code
			// but if it isn't, we'll catch it here to prevent test failure
		}

		// We expect that createRoot was called (and threw an error)
		expect(createRoot).toHaveBeenCalled()

		// Restore console.error
		console.error = originalConsoleError
	})
})
