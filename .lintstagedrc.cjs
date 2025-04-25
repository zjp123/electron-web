module.exports = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --cache --fix", // 使用 ESLint 修复 JavaScript/TypeScript 文件
    "prettier --write" // 使用 Prettier 格式化 JavaScript/TypeScript 文件
  ],
  "*.{css,scss,less}": [
    "stylelint --cache --fix", // 使用 Stylelint 修复 CSS/SCSS 和 styled-components 中的样式
    "prettier --write" // 使用 Prettier 格式化样式文件
  ],
  "*.{json,md}": ["prettier --write"],
  // 忽略以下文件或目录
  "dist/**": "",
  "node_modules/**": "",
  "coverage/**": "",
};
