import fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { securityPlugin } from './plugins/security.js';
import { loggingPlugin } from './plugins/logging.js';
import { healthRoutes } from './routes/health.js';

/**
 * Creates and configures the Fastify server instance.
 * Does NOT start listening - that is done in index.js.
 * 
 * This separation enables:
 * - Testability via inject() without binding to a port
 * - Clear separation between server creation and startup
 * - Plugin encapsulation for maintainability
 * 
 * @returns {Promise<import('fastify').FastifyInstance>} Configured Fastify instance
 */
export async function createServer() {
  const server = fastify({
    logger: {
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
      genReqId: () => randomUUID(),
      requestIdLogLabel: 'reqId',
    },
  });

  // Register security headers plugin
  await server.register(securityPlugin);

  // Register logging plugin for correlation IDs
  await server.register(loggingPlugin);

  // Register health check routes
  await server.register(healthRoutes);

  // Global error handler
  server.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, reqId: request.id }, 'Request error');
    
    if (error.statusCode) {
      reply.code(error.statusCode);
    }
    
    reply.send({
      error: error.message || 'Internal server error',
      statusCode: error.statusCode || 500,
    });
  });

  // Global 404 handler
  server.setNotFoundHandler((request, reply) => {
    request.log.warn({ reqId: request.id }, 'Not found');
    reply.code(404).send({
      error: 'Not Found',
      message: `Cannot ${request.method} ${request.url}`,
      statusCode: 404,
    });
  });

  return server;
}
