import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./", // 👈 важливо для продакшну (правильні шляхи до ресурсів)
  server: {
    host: "0.0.0.0", // щоб працювало і локально, і в docker/preview
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // стандартно, але можна міняти
    sourcemap: false, // вимкни на проді, щоб не світити код
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"], // трішки краща оптимізація
        },
      },
    },
  },
}));
