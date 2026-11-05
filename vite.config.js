import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Build vaqtida config.example.js -> config.js nusxalash.
 * (Vercel'da config.js .gitignore tufayli mavjud emas)
 */
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
  plugins: [react(), ensureConfigExists(), serveRootAssets(), copyRootAssets()],
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