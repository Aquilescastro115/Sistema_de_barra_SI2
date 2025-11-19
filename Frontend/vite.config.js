import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build:{
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',  // Hacer que Vite escuche en todas las interfaces de red
    port: 3000,        // El puerto que ya has mapeado en Docker
  },
})
