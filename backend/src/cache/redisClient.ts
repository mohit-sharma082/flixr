import Redis from 'ioredis';
import { config } from '../config';

/**
 * Redis is a cache, not a source of truth: if it is down or still starting
 * (normal for the first seconds of `docker compose up`), requests must fall
 * through to TMDB rather than queue up behind a reconnect.
 *
 * - `maxRetriesPerRequest: 1` fails a command fast instead of buffering it.
 * - `enableOfflineQueue: false` rejects immediately while disconnected, so a
 *   cache read can't add latency to a request that would have worked anyway.
 * - `retryStrategy` keeps reconnecting in the background, capped, so the cache
 *   comes back on its own once Redis is up.
 */
export const redisClient = new Redis({
    host: config.redisHost,
    port: config.redisPort,
    ...(config.redisPassword ? { password: config.redisPassword } : {}),
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (times) => Math.min(times * 200, 5000),
});
