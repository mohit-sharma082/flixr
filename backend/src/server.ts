import { config } from './config'; // MUST be first: loads .env and validates required secrets
import mongoose from 'mongoose';
import app from './app';

async function start() {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }

    app.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
    });
}

start();
