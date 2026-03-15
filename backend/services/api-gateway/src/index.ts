import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import { createLogger } from '@cyberscout/logger';
import { createRedisClient } from '@cyberscout/redis-client';
import { errorHandler } from '@cyberscout/error-handler';
import { AppError } from '@cyberscout/error-handler';

const logger = createLogger('api-gateway');
const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

// ── Service URLs ──────────────────────────────────────────────────────────────
const SERVICES = {
  auth: process.env['AUTH_SERVICE_URL'] ?? 'http://localhost:3001',
  courses: process.env['COURSE_SERVICE_URL'] ?? 'http://localhost:3002',
  chat: process.env['CHAT_SERVICE_URL'] ?? 'http://localhost:3003',
  billing: process.env['BILLING_SERVICE_URL'] ?? 'http://localhost:3004',
};

// ── Rate limit middleware ──────────────────────────────────────────────────────
function createRateLimiter(redis: ReturnType<typeof createRedisClient>, limit: number, windowSec: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `ratelimit:gateway:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    if (count > limit) {
      next(new AppError('RATE_LIMIT_EXCEEDED', 429));
      return;
    }
    next();
  };
}

// ── Proxy options ─────────────────────────────────────────────────────────────
function proxyOpts(target: string) {
  return {
    proxyReqPathResolver: (req: Request) => req.originalUrl.replace('/api', ''),
    proxyErrorHandler: (err: Error, res: Response, next: NextFunction) => {
      logger.error({ err, target }, 'Proxy error');
      next(new AppError('GATEWAY_UPSTREAM_ERROR', 502));
    },
    // Forward client IP to services
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq: Request) => {
      proxyReqOpts.headers['X-Forwarded-For'] = srcReq.ip;
      proxyReqOpts.headers['X-Forwarded-Proto'] = srcReq.protocol;
      return proxyReqOpts;
    },
    // Pass through SSE streams without buffering
    userResDecorator: undefined as any,
  };
}

async function main() {
  const redis = createRedisClient();
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    }),
  );

  // Global rate limiter: 200 req/min per IP
  const globalLimiter = createRateLimiter(redis, 200, 60);
  app.use(globalLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway', uptime: process.uptime() });
  });

  // ── Route table ──────────────────────────────────────────────────────────
  // Auth service
  app.use('/api/auth', proxy(SERVICES.auth, {
    proxyReqPathResolver: (req) => `/auth${req.path}`,
    proxyErrorHandler: (err, _res, next) => {
      logger.error({ err }, 'Auth service proxy error');
      next(new AppError('GATEWAY_UPSTREAM_ERROR', 502));
    },
  }));

  // Course service
  app.use('/api/courses', proxy(SERVICES.courses, {
    proxyReqPathResolver: (req) => `/courses${req.path}`,
    proxyErrorHandler: (err, _res, next) => {
      logger.error({ err }, 'Course service proxy error');
      next(new AppError('GATEWAY_UPSTREAM_ERROR', 502));
    },
  }));

  // Dashboard summary (served by course-service)
  app.use('/api/dashboard', proxy(SERVICES.courses, {
    proxyReqPathResolver: (req) => `/courses/dashboard${req.path}`,
    proxyErrorHandler: (err, _res, next) => {
      logger.error({ err }, 'Course service proxy error');
      next(new AppError('GATEWAY_UPSTREAM_ERROR', 502));
    },
  }));

  // Chat service — SSE streams require no response buffering
  app.use('/api/chat', proxy(SERVICES.chat, {
    proxyReqPathResolver: (req) => `/chat${req.path}`,
    parseReqBody: false, // preserve raw body for streaming
    proxyErrorHandler: (err, _res, next) => {
      logger.error({ err }, 'Chat service proxy error');
      next(new AppError('GATEWAY_UPSTREAM_ERROR', 502));
    },
  }));

  // Billing service — webhook needs raw body, proxied directly
  app.use('/api/subscription', proxy(SERVICES.billing, {
    proxyReqPathResolver: (req) => `/subscription${req.path}`,
    parseReqBody: false,
    proxyErrorHandler: (err, _res, next) => {
      logger.error({ err }, 'Billing service proxy error');
      next(new AppError('GATEWAY_UPSTREAM_ERROR', 502));
    },
  }));

  // 404 for unknown routes
  app.use((_req, _res, next) => next(new AppError('ROUTE_NOT_FOUND', 404)));
  app.use(errorHandler as express.ErrorRequestHandler);

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT, services: SERVICES }, 'API Gateway started');
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close();
    await redis.quit();
    logger.info('API Gateway shut down');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
