import Redis from 'ioredis';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = +(process.env.REDIS_PORT || 6379);

export const redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    // password: '7Znv?bZ391k%'
});

// helper wrappers if needed can be added here
