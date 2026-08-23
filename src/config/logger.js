import pino from 'pino';
import { env } from './env.js';

// Create Pino logger with NODE_ENV-based configuration
const logger = pino({
  level: env.LOG_LEVEL,
  transport: 
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
});

export default logger;
