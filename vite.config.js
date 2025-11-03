import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/agilow-bug-frontend/",
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.tsx"),
      name: "AgiloWidget",
      fileName: () => "widget.js",
      formats: ["iife"], // single runnable script
    },
  },
});
