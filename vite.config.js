import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';

function ensureConfigExists() {
  return {
    name: 'ensure-config-exists',
    buildStart() {
      const configPath = path.resolve(process.cwd(), 'src/components/config/config.js');
      const examplePath = path.resolve(process.cwd(), 'src/components/config/config.example.js');
      if (!fs.existsSync(configPath)) {
        if (fs.existsSync(examplePath)) {
          fs.copyFileSync(examplePath, configPath);
          console.log('[ensure-config-exists] config.example.js -> config.js nusxalandi');
        } else {
          console.warn('[ensure-config-exists] config.example.js topilmadi!');
        }
      } else {
        console.log('[ensure-config-exists] config.js mavjud, o\'zgartirilmadi');
      }
    },
  };
}

function copyRootAssets() {
  const rootAssets = ['game', 'image', 'sound'];
  return {
    name: 'copy-root-assets',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist');
      for (const dir of rootAssets) {
        const src = path.resolve(process.cwd(), dir);
        const dest = path.join(outDir, dir);
        if (!fs.existsSync(src)) {
          console.warn(`[copy-root-assets] Missing: ${src}`);
          continue;
        }
        fs.cpSync(src, dest, { recursive: true });
        console.log(`[copy-root-assets] Copied ${dir} -> dist/${dir}`);
      }
    },
  };
}

function serveRootAssets() {
  const rootAssets = ['game', 'image', 'sound'];
  return {
    name: 'serve-root-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        for (const dir of rootAssets) {
          if (url.startsWith(`/${dir}/`)) {
            const filePath = path.resolve(process.cwd(), '.' + url);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const mime = {
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.webp': 'image/webp',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.rar': 'application/vnd.rar',
                '.7z': 'application/x-7z-compressed',
                '.zip': 'application/zip',
              }[ext] || 'application/octet-stream';
              res.setHeader('Content-Type', mime);
              res.setHeader('Access-Control-Allow-Origin', '*');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    ensureConfigExists(),
    serveRootAssets(),
    copyRootAssets(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'image/logo.png'],
      manifest: {
        name: 'Fuzz — PC Gaming Platform',
        short_name: 'Fuzz',
        description: 'Fuzz — Professional PC Gaming Platform',
        theme_color: '#100b0a',
        background_color: '#100b0a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/image/logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/image/logo.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/my-backend\.updbackend\.workers\.dev\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: { port: 5173, open: false },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 1200 },
});