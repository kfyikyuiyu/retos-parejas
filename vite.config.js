import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/retos-parejas/'  // Cambia "retos-parejas" por el nombre exacto de tu repositorio
})