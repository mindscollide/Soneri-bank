
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const isProd = env.VITE_ENV === "PROD";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    esbuild: {
      drop: isProd ? ["console", "debugger"] : [],
    },
    build: {
      assetsInclude: ["**/*.ttf"],
    },
  };
});
