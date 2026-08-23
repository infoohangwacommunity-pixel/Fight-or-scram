import { z } from 'zod';

// Environment schema - validates ALL required variables
const envSchema = z.object({
  // Application
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // WhatsApp
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_API_BASE_URL: z.string().url().default('https://graph.facebook.com/v19.0'),
  WEBHOOK_VERIFY_TOKEN: z.string().min(1),
  WEBHOOK_APP_SECRET: z.string().min(1),

  // Database
  DATABASE_URL: z.string().url(),

  // Cache / Queue
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // AI
  AI_PROVIDER: z.enum(['groq']).default('groq'),
  GROQ_API_KEY: z.string().min(1),

  // Security
  ENCRYPTION_KEY: z.string().min(32).max(64),
});

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Validate environment variables
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:');
  console.error('\nPlease ensure your .env file contains all required variables:');
  console.error('\nCopy .env.example to .env and fill in the values:');
  console.error('  cp .env.example .env');
  console.error('\nValidation errors:');
  console.error(result.error.format());
  process.exit(1);
}

export const env = result.data;
