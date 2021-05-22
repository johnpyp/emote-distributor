module.exports = {
	root: true,
	extends: ["airbnb-base", "plugin:@typescript-eslint/recommended", "prettier"],
	env: {
		node: true,
	},
	// settings: {
	// 	"import/resolver": {
	// 		typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
	// 	},
	// },
	rules: {
		"import/prefer-default-export": ["off"],
		"no-restricted-syntax": ["off"],
		"no-await-in-loop": ["off"],
		"no-console": ["off"],
		"import/extensions": ["error", "never"],
	},
	parser: "@typescript-eslint/parser",
};
