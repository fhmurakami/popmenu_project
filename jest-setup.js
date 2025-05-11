// This file runs after the test environment is set up (jsdom is available).

// Import custom Jest matchers from @testing-library/jest-dom.
// This provides matchers like `toBeInTheDocument()`, `toHaveTextContent()`, etc.
import "@testing-library/jest-dom"

// --- Other Global Test Setup (Optional) ---
// You can add other global mocks or configurations here if needed.
// For example, if your components rely on `localStorage` or other browser APIs:
// global.localStorage = {
//   getItem: jest.fn(),
//   setItem: jest.fn(),
//   clear: jest.fn(),
// };
