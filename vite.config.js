import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Root-level `game`, `image`, `sound` papkalarini
 * production build ichiga ko'chirish.
 */
function copyRootAssets() {
  return {
    name: 'copy-root-assets',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist');
      
      // Vercel'da bo'lsak, 16GB'lik game papkasini ko'chirmaymiz.
      // Lekin image va sound doim ko'chirilishi shart!
      let dirsToCopy = ['game', 'image', 'sound'];
      
      if (process.env.VERCEL) {
        dirsToCopy = ['image', 'sound']; // Vercel uchun faqat shular
        console.log('[copy-root-assets] Vercel aniqlanди. Faqat image va sound nusxalanadi.');
      }

      for (const dir of dirsToCopy) {
        const src = path.resolve(process.cwd(), dir);
        const dest = path.join(outDir, dir);
        
        if (!fs.existsSync(src)) {
          console.log(`[copy-root-assets] Skipped: ${dir} (topilmadi)`);
          continue;
        }
        
        // Agar dist ichida eski papka bo'lsa, uni tozalab, yangisini ko'chiramiz
        if (fs.existsSync(dest)) {
          fs.rmSync(dest, { recursive: true, force: true });
        }
        
        fs.cpSync(src, dest, { recursive: true });
        console.log(`[copy-root-assets] Copied ${dir} -> dist/${dir}`);
      }
    },
  };
}

/**
 * Dev server: root-level `game`, `image`, `sound` URL'larini serve qilish.
 */
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
  plugins: [react(), serveRootAssets(), copyRootAssets()],
  base: '/',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});