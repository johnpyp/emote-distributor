module.exports = {
	root: true,
	extends: ["airbnb-typescript/base", "plugin:@typescript-eslint/recommended", "prettier"],
	env: {
		node: true,
	},
	plugins: ["@typescript-eslint"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.eslint.json"],
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
		"import/no-cycle": ["off"],
		"consistent-return": ["off"],
	},
};
