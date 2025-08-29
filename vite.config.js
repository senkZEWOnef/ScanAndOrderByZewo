import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './frontend',
  publicDir: 'public',
  build: {
    outDir: '../dist'
  }
})
