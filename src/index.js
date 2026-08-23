import './config/env.js'; // Load dotenv and validate env first
import logger from './config/logger.js';

// Log startup message
logger.info('WaxPrep booting — environment valid');

// Exit cleanly after logging
process.exit(0);
