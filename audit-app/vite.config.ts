import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600, // Increase the warning limit slightly
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and related libraries into a separate chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split OpenReplay into a separate chunk
          'openreplay': ['@openreplay/tracker', '@openreplay/tracker-assist'],
          // Split GDS design system into a separate chunk
          'govuk': ['govuk-frontend'],
        }
      }
    }
  }
})
