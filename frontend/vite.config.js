import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://movierecommendation-1-lr1p.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
