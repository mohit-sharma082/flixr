import rateLimit from 'express-rate-limit';

// Tighter cap for the expensive TMDB search/discover endpoints, layered on top
// of the global limiter in app.ts to curb proxy abuse (audit H1).
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
});
