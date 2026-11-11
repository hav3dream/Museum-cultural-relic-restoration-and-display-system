import 'dotenv/config';
import express, { Router, Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createRestorationRoutes } from './routes/restoration.js';
import { createAuthRoutes } from './routes/auth.js';
import { runMigrations } from './db/migrate.js';
import { createCheckoutRoutes } from './routes/checkout.js';
import { createWebhookRoutes } from './routes/webhook.js';
import { createSubscriptionRoutes } from './routes/subscription.js';
import { createGalleryRoutes } from './routes/gallery.js';
import { createUserRoutes } from './routes/user.js';
import { createAIHealthRoutes } from './routes/ai-health.js';
import { createDigitalHumanRoutes } from './routes/digital-human.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Team D routes now implemented - see imports above

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const server = createServer(app);

  // Run database migrations
  await runMigrations();

  // Security headers
  app.use((req: Request, res: Response, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // CORS setup
  app.use(cors({
    origin: env.NODE_ENV === 'production'
      ? ['https://museum-restoration.example.com', 'https://museum-restoration.example.com']
      : true,
    credentials: true,
  }));
  app.use(cookieParser());

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount webhook routes BEFORE express.json() to handle raw body
  app.use('/api/webhooks', createWebhookRoutes());

  // Body parsing middleware with size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve uploaded files
  const uploadPath = path.resolve(env.UPLOAD_DIR);
  app.use('/uploads', express.static(uploadPath));
  app.use('/upload', express.static(path.resolve(process.cwd(), 'upload')));

  // Serve API docs (Swagger UI) — dev only
  if (env.NODE_ENV !== 'production') {
    const docsPath = path.resolve(process.cwd(), 'docs');
    app.use('/api-docs', express.static(docsPath));
  }

  // Mount API routes
  app.use('/api/auth', createAuthRoutes());
  app.use('/api/restoration', createRestorationRoutes());
  app.use('/api/checkout', createCheckoutRoutes());
  app.use('/api/subscription', createSubscriptionRoutes());
  app.use('/api/gallery', createGalleryRoutes());
  app.use('/api/user', createUserRoutes());
  app.use('/api/ai', createAIHealthRoutes());
  app.use('/api/digital-human', createDigitalHumanRoutes());

  // Serve static files from dist/public
  const staticPath = path.resolve(process.cwd(), 'dist', 'public');

  app.use(express.static(staticPath));

  // Return 404 for missing static assets instead of serving index.html
  app.use((req: Request, res: Response, next) => {
    if (/\.(js|css|png|jpg|jpeg|webp|svg|gif|ico|woff|woff2|ttf|eot|map)$/i.test(req.path)) {
      return res.status(404).end();
    }
    next();
  });

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  // Error handler (must be last)
  app.use(errorHandler);

  const port = env.PORT;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

startServer().catch(console.error);
