import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Expose the dev server on all network interfaces, useful for testing on other devices
    host: true,
  },
  preview: {
    // Expose the preview server on all network interfaces for deployment platforms like Render
    host: true,
    // Use the PORT environment variable provided by Render, with a fallback
    port: Number(process.env.PORT) || 10000,
  },
});
