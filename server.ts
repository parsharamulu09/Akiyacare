import http from 'http';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './src/backend/routes';

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Mount API router FIRST
  app.use('/api', apiRouter);

  let vite: any = null;

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[AikyaCare] Vite development middleware attached.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Graceful shutdown handling to avoid orphan processes holding the port
  let isShuttingDown = false;
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[AikyaCare] Received ${signal}. Shutting down server gracefully...`);
    if (vite) {
      try {
        await vite.close();
      } catch {
        // Ignore vite close error during shutdown
      }
    }
    httpServer.close(() => {
      console.log('[AikyaCare] Server closed successfully.');
      process.exit(0);
    });
    // Force exit after timeout if sockets stay open
    setTimeout(() => {
      process.exit(0);
    }, 2000).unref();
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[AikyaCare] Error: Port ${PORT} is already in use.`);
      console.error(`[AikyaCare] Another instance of AikyaCare or another process is already listening on 0.0.0.0:${PORT}.`);
      console.error(`[AikyaCare] Please terminate the existing process or set a different port via the PORT environment variable.\n`);
    } else {
      console.error('[AikyaCare] Server error:', err);
    }
    process.exit(1);
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🏥 AikyaCare Backend Server is running!`);
    console.log(`📍 URL: http://0.0.0.0:${PORT}`);
    console.log(`🚀 Rural AI Health Triage & Emergency Platform`);
    console.log(`=================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AikyaCare server:', err);
  process.exit(1);
});
