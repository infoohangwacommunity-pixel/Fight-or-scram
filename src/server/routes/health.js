import { randomISO } from 'node:crypto';

/**
 * Health check routes - liveness and readiness probes.
 * 
 * Liveness (/health/live): Is the process running?
 * - Returns 200 OK when process is alive
 * - Used by orchestrators to restart crashed processes
 * - Should NOT check external dependencies (DB, Redis, etc.)
 * 
 * Readiness (/health/ready): Is the process ready to accept traffic?
 * - Returns 200 OK when ready to serve requests
 * - Returns 503 Service Unavailable when not ready
 * - Used by load balancers to stop sending traffic
 * - Will check external dependencies in Stage 07
 * 
 * @type {import('fastify').FastifyPluginCallback}
 */
export async function healthRoutes(fastify) {
  // Liveness probe - is the process running?
  fastify.get('/health/live', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  // Readiness probe - is the process ready to accept traffic?
  fastify.get('/health/ready', async (request, reply) => {
    // Stage 02: No external dependencies yet
    // Stage 07: Will add Supabase and Redis checks here
    return {
      status: 'ok',
      checks: {},
      timestamp: new Date().toISOString(),
    };
  });

  fastify.log.info('Health check routes registered');
}
