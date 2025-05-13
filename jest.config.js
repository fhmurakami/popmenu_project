module.exports = {
	// Use 'jsdom' to simulate a browser environment for React components
	testEnvironment: "jsdom",

	// Module aliasing to resolve absolute imports (e.g., `import MyComponent from '@/components/MyComponent'`)
	// Adjust the path if your React components are not directly under `app/javascript/`.
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/app/javascript/$1",
		"^components/(.*)$": "<rootDir/app/javascript/components/$1",
		// Use identity-obj-proxy to mock CSS/Sass imports (and other assets if configured)
		// This prevents Jest from trying to parse CSS files as JavaScript
		"\\.(css|less|scss|sass)$": "identity-obj-proxy",
	},

	// Files that run after the test environment is set up but before each test file
	// This is where we'll import `@testing-library/jest-dom`.
	setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],

	// How jest should transform files before running tests
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
	},
	transformIgnorePatterns: ["/node_modules/"],

	// Directories where Jest should look for test files
	// Assumes tests are within or alongside `app/javascript` files
	testMatch: ["<rootDir>/app/javascript/**/*.(test|spec).(js|jsx|ts|tsx)"],

	// Directories that Jest should explicitly ignore when looking for tests
	testPathIgnorePatterns: ["/node_modules/", "/app/assets/builds/", "/vendor/"],

	// Code coverage configuration
	collectCoverage: true,
	coverageDirectory: "<rootDir>/coverage/",
	collectCoverageFrom: [
		"app/javascript/**/*.{js,jsx,ts,tsx}",
		"!app/javascript/**/*.{test,spec}.{js,jsx,ts,tsx}",
	],

	moduleDirectories: ["node_modules", "<rootDir>/app/javascript"],
}
