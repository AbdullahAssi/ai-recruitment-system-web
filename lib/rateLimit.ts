/**
 * Lightweight in-memory rate limiter.
 * Suitable for single-instance deployments (dev / Docker single container).
 * For multi-instance production deployments replace the store with Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent memory leaks.
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key);
  });
}, 60_000);

/**
 * Check whether a key is within the allowed rate limit.
 *
 * @param key        - Unique identifier (e.g. IP address + route).
 * @param maxRequests - Maximum requests allowed in the window.
 * @param windowMs   - Window size in milliseconds.
 * @returns `true` if the request is allowed, `false` if it should be blocked.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
