import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config';
import { redisClient } from './cache/redisClient';

import authRoutes from './routes/auth';

import movieRoutes from './routes/movie';
import peopleRoutes from './routes/people';
import tvRoutes from './routes/tv.routes';
import companyRoutes from './routes/company.routes';

import reviewRoutes from './routes/review';
import commentRoutes from './routes/comment.routes';
import commonRoutes from './routes/common.routes';
import errorHandler from './utils/error_handler';

const app = express();

// Behind a reverse proxy / Docker network, req.ip is the proxy unless we opt in.
// Rate limiting is keyed by IP, so getting this wrong either collapses every
// visitor into one bucket (unset) or lets them spoof their way out of it (blind
// `true`). Driven by TRUST_PROXY; defaults to false for direct exposure.
app.set('trust proxy', config.trustProxy);

app.use(helmet());

// CORS: enforce the CORS_ORIGINS allowlist in production; in dev, also allow any
// localhost/127.0.0.1 origin so the Next dev server (any port) works without config.
app.use(
    cors({
        origin(origin, callback) {
            // Non-browser clients (curl, server-to-server, RSC fetch) send no Origin.
            if (!origin) return callback(null, true);
            if (config.corsOrigins.includes(origin)) return callback(null, true);
            if (
                !config.isProd &&
                /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
            ) {
                return callback(null, true);
            }
            // Disallowed: omit CORS headers so the browser blocks it (request still completes).
            return callback(null, false);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '1mb' }));

// Cache-Control HTTP Headers middleware
app.use((req, res, next) => {
    if (req.method === 'GET') {
        const path = req.path;
        if (path.includes('/search')) {
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min
        } else if (path.includes('/trending') || path.includes('/homepage')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
        } else if (path.includes('/genres')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
        } else if (path.includes('/discover')) {
            res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 min
        } else if (/^\/api\/(movies|tv|people|companies)\/\d+/.test(path)) {
            res.setHeader('Cache-Control', 'public, max-age=21600'); // 6 hours
        }
    }
    next();
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: config.rateLimitMax,
    message: { error: true, message: 'Too many requests, please try again later.', statusCode: 429 },
    standardHeaders: true,
    legacyHeaders: false,
    // Container/orchestrator probes must never be throttled — a 429 on /health
    // reads as "unhealthy" and would restart a perfectly fine instance.
    skip: (req) => req.path === '/health',
});

const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: true, message: 'Too many search requests, please try again later.', statusCode: 429 },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: true, message: 'Too many authentication attempts, please try again later.', statusCode: 429 },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);
app.use(['/api/movies/search', '/api/tv/search', '/api/people/search', '/api/common/search'], searchLimiter);

// Request log. req.ip is what the rate limiters key on, so logging it makes a
// misconfigured `trust proxy` visible (every request showing the same proxy IP
// means all visitors share one bucket) instead of silent.
app.use((req, res, next) => {
    console.log(`~ ${req.method} ${req.path} [ip=${req.ip}]`);
    next();
});

// Mongo is connected in server.ts (and gates app.listen). Redis connects lazily below.

// Redis connects lazily on first command; surface its state in the logs.
redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('error', (err) => console.error('Redis error', err));

app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/movies', movieRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/people', peopleRoutes);

app.use('/api/companies', companyRoutes);

app.use('/api/common', commonRoutes);

app.use('/api/comments', commentRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) =>
    res.json({ ok: true, message: 'TMDB community API' })
);

// Readiness/liveness probe: 200 only when MongoDB is connected.
app.get('/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1; // 1 = connected
    // Redis is a cache, not a dependency: a cold cache degrades latency, not
    // correctness, so its state is reported but does not fail the probe.
    res.status(dbConnected ? 200 : 503).json({
        ok: dbConnected,
        db: dbConnected ? 'connected' : 'disconnected',
        cache: redisClient.status === 'ready' ? 'connected' : redisClient.status,
        uptime: process.uptime(),
    });
});

app.use(errorHandler);

export default app;
