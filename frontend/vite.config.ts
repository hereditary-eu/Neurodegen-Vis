import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: "NEURO_",
  // Deployment on Demo Server.
  base: "/neurodegen-vis",

  // // to run locally via Docker, uncomment the following line:
  // base: "./",
});
