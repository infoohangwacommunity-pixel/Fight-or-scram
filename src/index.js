import { createServer } from './server/server.js';
import { env } from './config/env.js';
import logger from './config/logger.js';
import closeWithGrace from 'close-with-grace';

/**
 * WaxPrep Application Server
 * 
 * Entry point that creates the Fastify server, starts listening,
 * and handles graceful shutdown.
 */

async function main() {
  // Create and configure the server
  const server = await createServer();

  // Register graceful shutdown handler
  closeWithGrace({ delay: 10000 }, async ({ err }) => {
    if (err) {
      logger.error({ err }, 'Shutdown triggered by error');
    }
    logger.info('Shutting down gracefully - draining in-flight requests');
    await server.close();
    logger.info('Server shut down completely');
  });

  // Start listening
  const start = async () => {
    try {
      await server.listen({ port: env.PORT, host: '0.0.0.0' });
      logger.info({ url: `http://localhost:${env.PORT}` }, 'WaxPrep server listening');
    } catch (err) {
      logger.error({ err }, 'Failed to start server');
      process.exit(1);
    }
  };

  await start();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled rejection');
  process.exit(1);
});

// Start the application
main();
