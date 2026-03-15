import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: 'main/index.ts'
      }
    }
  },
  preload: {
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: 'main/preload.ts'
      }
    }
  },
  renderer: {
    root: 'renderer',
    build: {
      outDir: '../out/renderer',
      rollupOptions: {
        input: 'renderer/index.html'
      }
    },
    plugins: [vue(), tailwindcss()]
  }
})
