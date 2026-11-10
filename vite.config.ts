import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export const PWA_WORKBOX_GLOB_IGNORES: readonly string[] = [
  '**/vendor-firebase-*.js',
  '**/vendor-canvg-*.js',
];

export function resolvePwaManualChunk(id: string): string | undefined {
  if (typeof id !== 'string' || !id.trim()) {
    return undefined;
  }
  if (
    id.includes('node_modules/react/') ||
    id.includes('node_modules\\react\\') ||
    id.includes('node_modules/react-dom/') ||
    id.includes('node_modules\\react-dom\\') ||
    id.includes('vite/preload-helper')
  ) {
    return 'vendor-react';
  }
  if (id.includes('node_modules/dexie') || id.includes('node_modules\\dexie')) {
    return 'vendor-dexie';
  }
  if (
    id.includes('node_modules/@tiptap') ||
    id.includes('node_modules\\@tiptap') ||
    id.includes('node_modules/prosemirror-') ||
    id.includes('node_modules\\prosemirror-')
  ) {
    return 'vendor-tiptap';
  }
  if (
    id.includes('node_modules/firebase') ||
    id.includes('node_modules\\firebase') ||
    id.includes('node_modules/@firebase') ||
    id.includes('node_modules\\@firebase')
  ) {
    return 'vendor-firebase';
  }
  if (
    id.includes('node_modules/canvg') ||
    id.includes('node_modules\\canvg') ||
    id.includes('node_modules/html2canvas/') ||
    id.includes('node_modules\\html2canvas\\') ||
    id.includes('node_modules/dompurify') ||
    id.includes('node_modules\\dompurify') ||
    id.includes('node_modules/core-js') ||
    id.includes('node_modules\\core-js') ||
    id.includes('node_modules/regenerator-runtime') ||
    id.includes('node_modules\\regenerator-runtime') ||
    id.includes('node_modules/svg-pathdata') ||
    id.includes('node_modules\\svg-pathdata') ||
    id.includes('node_modules/stackblur-canvas') ||
    id.includes('node_modules\\stackblur-canvas') ||
    id.includes('node_modules/rgbcolor') ||
    id.includes('node_modules\\rgbcolor') ||
    id.includes('node_modules/raf') ||
    id.includes('node_modules\\raf')
  ) {
    return 'vendor-canvg';
  }
  if (
    id.includes('node_modules/jspdf') ||
    id.includes('node_modules\\jspdf') ||
    id.includes('node_modules/html2canvas-pro') ||
    id.includes('node_modules\\html2canvas-pro')
  ) {
    return 'vendor-pdf-canvas';
  }
  if (
    id.includes('data/scores/manifest.json') ||
    id.includes('data\\scores\\manifest.json') ||
    id.includes('data/scores/scoreboardManifest') ||
    id.includes('data\\scores\\scoreboardManifest')
  ) {
    return 'scores-manifest';
  }
  if (
    id.includes('data/scores/blocks/') ||
    id.includes('data\\scores\\blocks\\') ||
    id.includes('data/scores/scoreboardCatalog') ||
    id.includes('data\\scores\\scoreboardCatalog')
  ) {
    return 'scores-catalog';
  }
  if (
    id.includes('data/cidCatalog') ||
    id.includes('data\\cidCatalog') ||
    id.includes('data/cidSpecialtyAndAdminItems') ||
    id.includes('data\\cidSpecialtyAndAdminItems')
  ) {
    return 'cid-catalog';
  }
  if (
    id.includes('data/pediatricMeds') ||
    id.includes('data\\pediatricMeds') ||
    id.includes('data/pediatricHospitalAndProtocols') ||
    id.includes('data\\pediatricHospitalAndProtocols')
  ) {
    return 'pediatric-catalog';
  }
  if (
    id.includes('data/medications/') ||
    id.includes('data\\medications\\') ||
    id.includes('data/medicationDatabase') ||
    id.includes('data\\medicationDatabase')
  ) {
    return 'clinical-catalogs';
  }
  return undefined;
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'maskable-icon-512x512.png',
        ],
        manifest: {
          name: 'PresCMed — Prescrição Médica & Cálculos',
          short_name: 'PresCMed',
          description: 'Sistema de prescrição médica digital, cálculo de doses pediátricas, atestados e receitas com funcionamento 100% offline.',
          theme_color: '#0E1420',
          background_color: '#0E1420',
          display: 'standalone',
          orientation: 'any',
          scope: '/',
          start_url: '/',
          lang: 'pt-BR',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
          categories: ['medical', 'productivity', 'health'],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          globIgnores: [...PWA_WORKBOX_GLOB_IGNORES],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: resolvePwaManualChunk,
        },
      },
    },
    test: {
      fsModuleCache: true,
    },
  };
});
