import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Required: allows ngrok tunneling for MiniPay Developer Mode testing
    // Usage: npx ngrok http 5173  → paste URL into MiniPay Developer Settings
    allowedHosts: [
      ".ngrok.app",
      ".ngrok-free.dev",
      ".ngrok-free.app",
      "localhost",
    ],
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
