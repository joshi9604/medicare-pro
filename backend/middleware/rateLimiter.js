const expressRateLimit = require('express-rate-limit');
const rateLimit = expressRateLimit; // default export is the rateLimit factory
const { ipKeyGenerator } = expressRateLimit;

const { RedisStore } = require('rate-limit-redis');

const logger = require('../utils/logger');
const { getRedisClient, isRedisConnected } = require('../config/redis');

// Rate limit configuration: max 5 requests per 15 minutes.
const MAX_REQUESTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * Build a consistent professional JSON response when the client is blocked.
 */
const rateLimitExceededHandler = (req, res) => {
  // express-rate-limit sets `req.rateLimit` when using its built-in middleware.
  const resetTime = req.rateLimit?.resetTime ? new Date(req.rateLimit.resetTime) : null;
  const retryAfterSeconds = resetTime
    ? Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
    : undefined;

  return res.status(429).json({
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
    retryAfterSeconds,
  });
};

/**
 * Key generator: rate limit per IP + endpoint path (so each auth route is isolated).
 */
const keyGenerator = (req) => {
  // express-rate-limit validates IPv6 handling for custom key generators.
  // Using `ipKeyGenerator(req)` ensures consistent behavior across IPv4/IPv6.
  const ip = ipKeyGenerator(req);
  const base = req.baseUrl || '';
  const path = req.path || '';
  return `${ip}:${base}${path}`;
};

/**
 * Build Redis-backed limiter (only if Redis is connected during app init).
 */
const rateLimitOptions = {
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitExceededHandler,
};

// Fallback limiter: keeps auth functional if Redis is unavailable.
const memoryLimiter = rateLimit(rateLimitOptions);

// Redis limiter: created only when Redis is connected at module initialization time.
let redisLimiter = null;
if (isRedisConnected()) {
  const redisClient = getRedisClient();

  // redis@5 `client.sendCommand(args)` expects an array where args[0] is the command.
  const redisStore = new RedisStore({
    prefix: 'medicare-pro:rate-limit:',
    sendCommand: (...commandParts) => redisClient.sendCommand(commandParts),
  });

  redisLimiter = rateLimit({
    ...rateLimitOptions,
    store: redisStore,
  });
}

/**
 * Middleware to apply the correct limiter strategy.
 */
function authRateLimiter(req, res, next) {
  try {
    // If Redis was connected during boot, use RedisStore-backed limiter.
    // Otherwise, fall back to in-memory limiter to avoid breaking auth.
    return (redisLimiter || memoryLimiter)(req, res, next);
  } catch (err) {
    // Never break requests due to rate limiter issues.
    logger.warn('Rate limiter failure, falling back to allow-next', err.message);
    return next();
  }
}

module.exports = {
  authRateLimiter,
  MAX_REQUESTS,
  WINDOW_MS,
};

