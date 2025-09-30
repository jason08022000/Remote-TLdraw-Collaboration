import { config } from 'dotenv';
import { Environment } from '../types';

// Load environment variables
config();

const requiredEnvVars = ['STREAM_API_KEY', 'STREAM_API_SECRET', 'LIVEBLOCKS_SECRET_KEY'] as const;

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env: Environment = {
  NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  STREAM_API_KEY: process.env.STREAM_API_KEY!,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET!,
  LIVEBLOCKS_SECRET_KEY: process.env.LIVEBLOCKS_SECRET_KEY!,
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
