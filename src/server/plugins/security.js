import helmet from '@fastify/helmet';

/**
 * Security plugin - registers Helmet for HTTP security headers.
 * 
 * Provides defense-in-depth against:
 * - MIME sniffing (X-Content-Type-Options: nosniff)
 * - Clickjacking (X-Frame-Options: DENY)
 * - Protocol downgrade (Strict-Transport-Security)
 * - XSS and other common attacks
 * 
 * @type {import('fastify').FastifyPluginCallback}
 */
export async function securityPlugin(fastify) {
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disabled for API-only server
    global: true,
  });

  fastify.log.info('Security headers enabled via Helmet');
}
