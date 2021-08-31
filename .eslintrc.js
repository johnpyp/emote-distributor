module.exports = {
  root: true,
  extends: [
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  env: {
    node: true,
  },
  plugins: ["@typescript-eslint", "import", "node"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"],
  },
  rules: {
    // "node/file-extension-in-import": ["error", "never"],
    "import/extensions": ["off", "always", { ignorePackages: true }],
    "import/prefer-default-export": ["off"],
    "no-restricted-syntax": ["off"],
    "no-await-in-loop": ["off"],
    "no-console": ["off"],
    "import/no-cycle": ["off"],
    "consistent-return": ["off"],
    "class-methods-use-this": ["off"],

    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "snake_case"],
        leadingUnderscore: "allow",
      },
      {
        selector: "parameter",
        format: ["camelCase"],
        leadingUnderscore: "allow",
      },

      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
};
