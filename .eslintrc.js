// .eslintrc.js
module.exports = {
  env: {
    node: true, // 添加这一行以启用 Node.js 环境
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
    // project: "./tsconfig.json",
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
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

// module.exports = {
//   root: true,
//   env: { browser: true, es2020: true, serviceworker: true },
//   extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
//   ignorePatterns: [
//     'dist',
//     '.eslintrc.cjs',
//     'tailwind.config.cjs',
//     'postcss.config.cjs',
//     'tsconfig.json',
//     'tsconfig.node.json',
//     'forge.config.cjs',
//     'plugin.cjs',
//     'electron-builder.config.js',
//     'wasm_exec.js',
//     'scripts',
//   ],
//   parser: '@typescript-eslint/parser',
//   plugins: ['react-refresh'],
//   rules: {
//     'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
//   },
// };
