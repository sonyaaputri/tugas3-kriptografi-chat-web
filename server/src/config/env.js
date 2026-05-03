import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'webchat',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  
  // JWT
  JWT_PRIVATE_KEY_PATH: process.env.JWT_PRIVATE_KEY_PATH || path.join(projectRoot, 'server/src/tests/jwt.keys/private-es256.pem'),
  JWT_PUBLIC_KEY_PATH: process.env.JWT_PUBLIC_KEY_PATH || path.join(projectRoot, 'server/src/tests/jwt.keys/public-es256.pem'),
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'ES256',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || 3600, 
};