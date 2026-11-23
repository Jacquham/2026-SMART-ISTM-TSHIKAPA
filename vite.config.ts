import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Application web responsive + installable (PWA) : ordinateur, tablette, Android.
// Les chemins sont relatifs pour fonctionner dans un sous-dossier (GitHub Pages).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-512.png'],
      manifest: {
        id: './',
        name: "SMART-ISTM-T'PA",
        short_name: 'SMART-ISTM',
        description: "Système Moderne d'Administration et de Gestion Académique — ISTM-Tshikapa",
        lang: 'fr',
        theme_color: '#1F3A6E',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-512.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        // Les données ne sont jamais mises en cache par le service worker : seule l'interface l'est.
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
});
