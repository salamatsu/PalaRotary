import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 8002,
      proxy: {
        "/api": {
          target: env.VITE_BASEURL,
          changeOrigin: true,
        },
      },
    },
    build: {
      // Enable code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            "react-vendor": ["react", "react-dom", "react-router"],
            "antd-vendor": ["antd", "@ant-design/icons"],
            "query-vendor": ["@tanstack/react-query"],
            "chart-vendor": ["highcharts", "highcharts-react-official", "recharts"],
            "utils-vendor": ["axios", "dayjs", "zustand"],
          },
          // Separate assets by type for better caching
          assetFileNames: (assetInfo) => {
            const fileName = assetInfo.names?.[0] || "";
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(fileName)) {
              return `assets/media/[name]-[hash][extname]`;
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(fileName)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(fileName)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
      // Chunk size warnings - increased for video files
      chunkSizeWarningLimit: 2000,
      // Control asset inlining - don't inline large files
      assetsInlineLimit: 4096, // 4KB - files larger than this won't be inlined
      // Source maps for production debugging
      sourcemap: mode === "development",
    },
    optimizeDeps: {
      // Pre-bundle dependencies for faster dev server
      include: [
        "react",
        "react-dom",
        "react-router",
        "antd",
        "@ant-design/icons",
        "@tanstack/react-query",
        "axios",
        "dayjs",
        "zustand",
        "clsx",
        "zod",
      ],
    },
  };
});
