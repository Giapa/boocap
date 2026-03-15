import { defineConfig } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    build: {
      outDir: "out/main",
      rollupOptions: {
        input: "main/index.ts",
      },
    },
  },
  preload: {
    build: {
      outDir: "out/preload",
      lib: {
        entry: "main/preload.ts",
        formats: ["cjs"],
      },
      rollupOptions: {
        output: {
          entryFileNames: "preload.cjs",
        },
      },
    },
  },
  renderer: {
    root: "renderer",
    build: {
      outDir: "../out/renderer",
      rollupOptions: {
        input: "renderer/index.html",
      },
    },
    plugins: [vue(), tailwindcss()],
  },
});
