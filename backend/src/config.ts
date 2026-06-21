import dotenv from 'dotenv';

// Load .env before anything else reads process.env.
// This module must be imported first in server.ts so that validation runs at boot.
dotenv.config();

function requireEnv(name: string, opts: { minLength?: number } = {}): string {
    const value = process.env[name];
    if (!value || value.trim() === '') {
        throw new Error(`[config] Missing required environment variable: ${name}`);
    }
    if (opts.minLength && value.length < opts.minLength) {
        throw new Error(
            `[config] ${name} is too short (min ${opts.minLength} chars). ` +
                'Generate a strong value, e.g. `openssl rand -hex 48`.'
        );
    }
    return value;
}

function parseOrigins(raw: string | undefined): string[] | undefined {
    if (!raw || raw.trim() === '') return undefined;
    return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

/**
 * Validated, typed application config.
 * Required secrets throw at startup (fail-fast) instead of at request time.
 */
export const config = {
    port: +(process.env.PORT || 4000),
    nodeEnv: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',

    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/tmdbapp',

    jwtSecret: requireEnv('JWT_SECRET', { minLength: 32 }),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    tmdbApiKey: requireEnv('TMDB_API_KEY'),
    tmdbBase: process.env.TMDB_BASE || 'https://api.themoviedb.org/3',
    cacheTtlSeconds: +(process.env.CACHE_TTL_SECONDS || 3600),

    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: +(process.env.REDIS_PORT || 6379),
    redisPassword: process.env.REDIS_PASSWORD || undefined,

    // Comma-separated allowlist of browser origins. Empty => dev default below.
    corsOrigins: parseOrigins(process.env.CORS_ORIGINS) || ['http://localhost:3000'],
};
