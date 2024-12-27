module.exports = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --cache --fix", // 使用 ESLint 修复 JavaScript/TypeScript 文件
  ],
  // "*.{css,scss,js,jsx,ts,tsx}": [
  //   "stylelint --cache --fix", // 使用 Stylelint 修复 CSS/SCSS 和 styled-components 中的样式
  // ],
  "*.{json,md}": ["prettier --write"],
  // 忽略以下文件或目录
  "dist/**": "",
  "node_modules/**": "",
  "coverage/**": "",
};
