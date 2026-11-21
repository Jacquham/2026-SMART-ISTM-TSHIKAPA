import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Application web responsive + installable (PWA) : ordinateur, tablette, Android.
// Le même code servira plus tard à produire une application Play Store.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: "SMART-ISTM-T'PA",
        short_name: 'SMART-ISTM',
        description: "Système Moderne d'Administration et de Gestion Académique — ISTM-Tshikapa",
        lang: 'fr',
        theme_color: '#1F3A6E',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Les données ne sont jamais mises en cache par le service worker : seule l'interface l'est.
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
});
            
