module.exports = {
  env: {
    node: true,
    browser: true,
    es2020: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "react", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
    "plugin:prettier/recommended",
  ],
  rules: {
    "react/prop-types": "off",
    "prettier/prettier": "error",
    singleQuote: "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
