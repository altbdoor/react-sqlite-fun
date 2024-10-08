import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
  build: {
    reportCompressedSize: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: ["codemirror"],
        },
      },
    },
  },
  worker: {
    format: "es",
  },
});
