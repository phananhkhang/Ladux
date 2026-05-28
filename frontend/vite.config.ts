import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    allowedHosts: true,
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
});
