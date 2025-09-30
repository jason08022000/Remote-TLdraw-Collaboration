export interface StreamTokenRequest {
  userId: string;
}

export interface StreamTokenResponse {
  apiKey: string;
  token: string;
  userId: string;
}

export interface ApiError {
  message: string;
  details?: string;
  code?: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
  uptime: number;
}

export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  STREAM_API_KEY: string;
  STREAM_API_SECRET: string;
  LIVEBLOCKS_SECRET_KEY: string;
}

export interface LiveblocksAuthRequest {
  userId: string;
}

export interface LiveblocksUser {
  id: string;
  info: {
    name: string;
    color: string;
    avatar: string;
  };
}
