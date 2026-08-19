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

/**
 * `trust proxy` value for Express. Behind Docker/nginx/Caddy the client IP is in
 * X-Forwarded-For, and without this every request looks like it comes from the
 * proxy — which would collapse per-IP rate limiting into one shared bucket.
 * Trusting blindly is the opposite risk (clients can spoof the header and evade
 * limits), so this is opt-in and hop-counted:
 *   unset/0 -> false (direct exposure)   1 -> one proxy in front   'loopback' etc. passed through
 */
function parseTrustProxy(raw: string | undefined): boolean | number | string {
    if (!raw || raw.trim() === '') return false;
    const v = raw.trim();
    if (v === 'false') return false;
    if (v === 'true') return 1;
    const n = Number(v);
    if (Number.isInteger(n) && n >= 0) return n === 0 ? false : n;
    return v; // named value understood by Express, e.g. 'loopback'
}

function parseOrigins(raw: string | undefined): string[] | undefined {
    if (!raw || raw.trim() === '') return undefined;
    return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function buildConfig() {
    return {
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

        // Number of reverse-proxy hops to trust for client IP (see parseTrustProxy).
        trustProxy: parseTrustProxy(process.env.TRUST_PROXY),

        // Global per-IP request budget per minute. A single detail page fans out to
        // several client-side calls, so this needs headroom over a naive "1 req = 1 view".
        rateLimitMax: +(process.env.RATE_LIMIT_MAX || 200),
    };
}


/**
 * Validated, typed application config.
 *
 * Required secrets fail at startup rather than at request time. The failure is
 * reported as a readable instruction, not a stack trace: this throws during
 * module load, so under `restart: unless-stopped` a raw trace would scroll past
 * every few seconds with the actual cause buried in it.
 */
function loadConfig(): ReturnType<typeof buildConfig> {
    try {
        return buildConfig();
    } catch (err: any) {
        console.error(
            '\n*** Flixr backend cannot start — configuration is incomplete ***\n' +
                `    ${err?.message ?? err}\n\n` +
                '    Set it in the environment (docker compose reads the .env file\n' +
                '    next to docker-compose.yml) and start again.\n'
        );
        process.exit(1);
    }
}

export const config = loadConfig();
