import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
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
        origin: true, // set more strict origins in production
        credentials: true,
    })
);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
});
app.use(limiter);

// DB connect
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tmdbapp';
mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

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

app.use(errorHandler);

export default app;
