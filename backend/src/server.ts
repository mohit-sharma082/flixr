import { config } from './config'; // MUST be first: loads .env and validates required secrets
import mongoose from 'mongoose';
import app from './app';
import { redisClient } from './cache/redisClient';

async function start() {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }

    const server = app.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
    });

    // Graceful shutdown: stop accepting new connections, drain in-flight requests,
    // then close Mongo + Redis before exiting (so rolling deploys don't drop requests).
    let shuttingDown = false;
    const shutdown = async (signal: string) => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`\n${signal} received — shutting down gracefully...`);

        server.close(async () => {
            try {
                await mongoose.disconnect();
                await redisClient.quit();
            } catch (err) {
                console.error('Error during shutdown:', err);
            } finally {
                process.exit(0);
            }
        });

        // Failsafe: force-exit if connections don't drain within the grace period.
        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10_000).unref();
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
}

start();
