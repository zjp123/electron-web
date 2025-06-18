import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import postcssPresetEnv from "postcss-preset-env";
import stylelint from "vite-plugin-stylelint";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig(({ mode }) => {
  console.log(mode);
  return {
    envDir: "./",
    plugins: [
      react(),
      stylelint({
        fix: true,
        include: ["src/**/*.{less,css}"],
        exclude: ["src/**/*.{ts,tsx,js,jsx}"],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "../../assets"),
        "@zjp-web/common": path.resolve(__dirname, "../../packages/zjp-common"),
        "@zjp-web/i18n": path.resolve(__dirname, "../../packages/zjp-i18n/src"),
      },
    },
    server: {
      port: 3100, // 配置开发服务器端口
      open: true, // 自动打开浏览器
      proxy: {
        // 配置代理
        "/api": {
          secure: false,
          target: "http://localhost:8080", // 代理目标地址
          changeOrigin: true, // 允许跨域
          rewrite: path => path.replace(/^\/api/, ""), // 重写路径，去除 /api 前缀
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          postcssPresetEnv({
            autoprefixer: {
              grid: true,
            },
          }),
        ],
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: true,
      // 针对移动端优化构建配置
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
      // 启用CSS代码分割
      cssCodeSplit: true,
      // 启用最小化混淆
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  };
});
