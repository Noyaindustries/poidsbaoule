import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { netlifyApiProxyRedirects } from './vite-plugin-netlify-api-proxy';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const viteApiUrl =
      env.VITE_API_URL ||
      env.API_URL ||
      process.env.VITE_API_URL ||
      process.env.API_URL;
    const missingApiUrl = !(viteApiUrl && String(viteApiUrl).trim());
    const isNetlifyBuild =
      Boolean(process.env.NETLIFY) ||
      Boolean(process.env.CONTEXT) ||
      Boolean(process.env.DEPLOY_PRIME_URL);

    if (mode === 'production' && missingApiUrl && !isNetlifyBuild) {
      const msg =
        'VITE_API_URL est absent (URL de l’API sans slash final). Sans cela, dist/_redirects ne proxifie pas vers une API externe ; ' +
        'utilisez des URLs relatives `/api/...` et un reverse-proxy (ou netlify.toml + fonctions).';
      console.warn(`\n[build] ${msg}\n`);
    }
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:5050',
            changeOrigin: true,
          },
        },
      },
      /** Même proxy qu’en dev : sans cela, `vite preview` répond 404 sur `/api/*`. */
      preview: {
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:5050',
            changeOrigin: true,
          },
        },
      },
      plugins: [react(), tailwindcss(), netlifyApiProxyRedirects(viteApiUrl)],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom', 'react-router-dom'],
              motion: ['motion'],
              icons: ['lucide-react'],
            }
          }
        }
      }
    };
});
