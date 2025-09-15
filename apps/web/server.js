import { createServer as createViteServer } from 'vite';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function startServer() {
  const app = express();

  // Comment out proxy for now - let Vite handle API routes directly
  // app.use(
  //   '/api',
  //   createProxyMiddleware({
  //     target: 'http://localhost:4000',
  //     changeOrigin: true,
  //     onProxyReq: (proxyReq, req, res) => {
  //       // Pass environment variables to the proxied server
  //       Object.keys(process.env).forEach((key) => {
  //         if (key.startsWith('NEXT_PUBLIC_')) {
  //           proxyReq.setHeader(key, process.env[key]);
  //         }
  //       });
  //     },
  //   })
  // );

  // Create Vite server
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        overlay: false,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
  });

  // Use Vite middleware
  app.use(vite.middlewares);

  // Serve the app
  app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
  });
}

startServer();