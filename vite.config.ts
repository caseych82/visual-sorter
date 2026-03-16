import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use relative paths for GitHub Pages project site compatibility
  base: command === 'build' ? './' : '/',
}))
