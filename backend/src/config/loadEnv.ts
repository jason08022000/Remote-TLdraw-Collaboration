import { config } from 'dotenv';
import { resolve } from 'path';

// 指定 .env 路径，避免工作目录差异
config({ path: resolve(__dirname, '../../.env') });
