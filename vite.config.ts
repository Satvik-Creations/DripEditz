import path from 'node:path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Do NOT expose server API keys into the client bundle. The client now proxies
      // requests to /api to the server which holds the real API key.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        // Proxy /api requests to the local server during development so fetch('/api/...') works
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            secure: false,
          }
        }
      },
      preview: {
        allowedHosts: ["dripeditz.onrender.com"],
        // preview can also proxy to the server if you use `vite preview` during testing
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            secure: false,
          }
        }
      }
    };
});
