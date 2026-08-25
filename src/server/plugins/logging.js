import { randomUUID } from 'node:crypto';

/**
 * Logging plugin - generates correlation IDs for every request.
 * 
 * Correlation IDs enable distributed tracing across:
 * - Database reads
 * - Redis operations
 * - AI API calls
 * - Tool executions
 * - WhatsApp API calls
 * 
 * Each request gets a unique UUID that is attached to all log entries,
 * enabling complete request tracing by searching for one ID.
 * 
 * @type {import('fastify').FastifyPluginCallback}
 */
export async function loggingPlugin(fastify) {
  // Generate correlation ID on every request
  fastify.addHook('onRequest', async (request, reply) => {
    // Generate new UUID for each request
    const correlationId = randomUUID();
    
    // Attach to request object
    request.context.correlationId = correlationId;
    
    // Create child logger with correlation ID
    request.log = request.log.child({ correlationId });
  });

  fastify.log.info('Correlation ID logging enabled');
}
