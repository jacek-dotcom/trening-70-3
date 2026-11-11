import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' => build działa też otwarty z dysku / z dowolnego podkatalogu.
export default defineConfig({
  base: process.env.GH_PAGES ? '/trening-70-3/' : './',
  plugins: [react(), tailwindcss()],
})
