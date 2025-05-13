module.exports = {
	presets: [
		// For Node.js environment in Jest tests
		["@babel/preset-env", { targets: { node: "current" } }],
		// For React JSX transformation
		["@babel/preset-react", { runtime: "automatic" }],
	],
}
