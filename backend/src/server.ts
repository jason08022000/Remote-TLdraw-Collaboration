import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env, isDevelopment } from './config/environment';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

class Server {
  private app: express.Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = env.PORT;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable CSP for API
    }));

    // Compression
    this.app.use(compression());

    // CORS - configure for your frontend domain in production
    this.app.use(cors({
      origin: isDevelopment 
        ? ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
        : process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDevelopment ? 1000 : 100, // Limit each IP to 100 requests per windowMs in production
      message: {
        message: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging in development
    if (isDevelopment) {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
      });
    }
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api', apiRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'Stream Token Service',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/api/health',
          tokens: '/api/tokens',
          liveblocks: '/api/liveblocks/auth',
        },
      });
    });

    // 404 handler for unmatched routes
    this.app.use(notFoundHandler);
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Stream Token Service started successfully`);
      console.log(`📍 Server running on port ${this.port}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${this.port}/api/health`);
      console.log(`🎯 Token endpoint: http://localhost:${this.port}/api/tokens`);
      
      if (isDevelopment) {
        console.log(`🔧 Development mode: detailed logging enabled`);
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Create and start server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default server;
