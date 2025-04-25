import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import path from "path";
// import tsconfigPaths from "vite-tsconfig-paths";
import postcssPresetEnv from "postcss-preset-env";

export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd());

  return {
    envDir: "./",
    plugins: [react()],
    // resolve: {
    //   alias: {
    //     "@": path.resolve(__dirname, "./src"), // 配置路径别名
    //     "@components": path.resolve(__dirname, "./src/components"),
    //     "@pages": path.resolve(__dirname, "./src/pages"),
    //     "@utils": path.resolve(__dirname, "./src/utils"),
    //     "@assets": path.resolve(__dirname, "./src/assets"),
    //   },
    // },
    server: {
      port: 3000, // 配置开发服务器端口
      open: true, // 自动打开浏览器
      proxy: {
        // 配置代理
        "/api": {
          secure: false,
          target: "http://localhost:8080", // 代理目标地址，从环境变量中读取
          // target: env.VITE_API_BASE_URL || "http://localhost:8080", // 代理目标地址，从环境变量中读取
          changeOrigin: true, // 允许跨域
          rewrite: path => path.replace(/^\/api/, ""), // 重写路径，去除 /api 前缀
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          postcssPresetEnv({
            // stage: 0,
            autoprefixer: {
              grid: true,
            },
          }),
        ],
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          math: "always",
          globalVars: {
            blue: "#1CC0FF",
          },
          modifyVars: {
            // 修改less变量的
            "primary-color": "#1DA57A", // 将主题色改为绿色
            "link-color": "#1DA57A", // 设置链接颜色为绿色
            "border-radius-base": "4px", // 设置圆角为 4px
          },
        },
      },
    },
    esbuild: {
      // pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : []
    },
    build: {
      outDir: "dist", // 配置构建输出目录
      assetsDir: "static", // 静态资源输出目录
      sourcemap: true, // 生成 sourcemap 文件，方便调试
      open: true, // 自动打开浏览器
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      rollupOptions: {
        output: {
          chunkFileNames: "static/js/[name]-[hash].js", //// 注意这里仍然使用 hash，rollup 会自动替换为 contenthash
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor"; // 将 node_modules 中的代码打包成 vendor chunk
            }
          },
        },
      },
    },
    define: {
      // 定义全局常量，例如版本号
      "process.env.VITE_APP_VERSION": JSON.stringify(process.env.npm_package_version),
    },
    optimizeDeps: {
      include: ["react", "react-dom"], // 强制预构建依赖
    },
  };
});

/*
环境变量：
Vite 使用 dotenv 来加载环境变量。默认情况下，Vite 会从以下文件中加载环境变量：
.env：所有环境都会加载。
.env.local：本地环境加载，会被 git 忽略。
.env.[mode]：指定模式的环境加载，例如 .env.development、.env.production。
.env.[mode].local：指定模式的本地环境加载，会被 git 忽略。
环境变量以 VITE_ 开头才能在客户端代码中使用。
例如，在 .env.development 文件中定义 VITE_API_BASE_URL=http://localhost:8080，
然后在 vite.config.ts 中使用 env.VITE_API_BASE_URL 读取该变量
*/

/*
define： 定义全局常量。例如，可以将 process.env.npm_package_version 定义为 
process.env.VITE_APP_VERSION，这样就可以在代码中使用 
process.env.VITE_APP_VERSION 获取项目版本号。注意这里使用 
JSON.stringify 将值转换为字符串。
*/
