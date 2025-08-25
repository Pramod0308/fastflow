import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_URL || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',      // check + fetch updates automatically
      workbox: {
        clientsClaim: true,            // new SW takes control immediately
        skipWaiting: true,             // activate right away (no waiting)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html'
      },
      devOptions: { enabled: true },
      manifest: {
        name: 'FastFlow',
        short_name: 'FastFlow',
        description: 'Intermittent fasting tracker',
        theme_color: '#00897B',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
});
