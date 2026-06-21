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

app.use(helmet());
app.use(express.json());
app.use(
    cors({
        origin(origin, callback) {
            // Allow non-browser clients (curl, server-to-server, native apps) that send no Origin.
            if (!origin) return callback(null, true);
            // Allowlist driven by CORS_ORIGINS env (comma-separated); defaults to localhost:3000 in dev.
            return callback(null, config.corsOrigins.includes(origin));
        },
        credentials: true,
    })
);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
});
app.use(limiter);

app.use((req, res, next) => {
    console.log(`~ ${req.method} ${req.path}`);
    next();
});

// Mongo is connected in server.ts (and gates app.listen). Redis connects lazily below.

// Redis connect
redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('error', (err) => console.error('Redis error', err));

app.use('/api/auth', authRoutes);

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
    res.status(dbConnected ? 200 : 503).json({
        ok: dbConnected,
        db: dbConnected ? 'connected' : 'disconnected',
        uptime: process.uptime(),
    });
});

app.use(errorHandler);

export default app;
