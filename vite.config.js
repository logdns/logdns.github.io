import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The site is served from the domain root, so assets are absolute.
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
