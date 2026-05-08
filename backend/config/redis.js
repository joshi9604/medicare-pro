const redis = require('redis');
const logger = require('../utils/logger');

// Centralized Redis connection setup for the whole backend.
// Uses `REDIS_URL` from environment variables:
//   REDIS_URL=redis://127.0.0.1:6379
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient = null;
let listenersAttached = false;
let redisConnected = false;

/**
 * Returns a singleton Redis client instance.
 * We keep it lazy so the app can still boot even if Redis is down.
 */
function getRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: REDIS_URL,
      // If Redis becomes temporarily unavailable, redis client will automatically retry.
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
      },
    });

    // Attach process-level listeners once.
    if (!listenersAttached) {
      listenersAttached = true;

      redisClient.on('connect', () => {
        redisConnected = true;
        logger.info('Redis connected');
      });

      redisClient.on('ready', () => {
        redisConnected = true;
        logger.info('Redis ready');
      });

      redisClient.on('error', (err) => {
        redisConnected = false;
        logger.error('Redis client error', err.message);
      });

      redisClient.on('end', () => {
        redisConnected = false;
        logger.warn('Redis connection closed');
      });
    }
  }

  return redisClient;
}

/**
 * Connect Redis during server startup.
 * IMPORTANT: we do not throw on failure to avoid breaking existing functionality.
 * Rate limiting will safely fall back to an in-memory strategy if Redis is unavailable.
 */
async function connectRedis() {
  const client = getRedisClient();

  // If already connected/open, no-op.
  if (redisConnected && client.isOpen) return client;

  try {
    await client.connect();
    redisConnected = true;
    logger.info(`Redis connected using ${REDIS_URL}`);
  } catch (err) {
    redisConnected = false;
    logger.warn(`Redis connection failed (${REDIS_URL})`, err.message);
  }

  return client;
}

/**
 * True when the Redis client is currently connected/open.
 */
function isRedisConnected() {
  const client = getRedisClient();
  return Boolean(redisConnected && client.isOpen);
}

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
};

