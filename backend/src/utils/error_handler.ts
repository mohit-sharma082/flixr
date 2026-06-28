// Centralized Express error-handling middleware.

import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware.
 * @param {Error} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    // Ensure err is of type Error
    const error = err as {
        status?: number;
        statusCode?: number;
        message?: string;
        response?: { status?: number; data?: any };
    };

    console.error(`\nError ~>`, error?.response?.data || error?.message || "Unknown error");

    // axios errors carry the upstream status on response.status (so a TMDB 404 stays a 404,
    // not a 500); fall back to err.status/statusCode, then 500.
    const statusCode =
        error?.response?.status || error?.status || error?.statusCode || 500;

    // Never leak internal/axios error text to clients on 5xx; pass client-error (4xx) messages through.
    const message =
        statusCode >= 500
            ? "Internal server error"
            : error?.message || "Request failed";
    const message_type = "INTERNAL_SERVER_ERROR";

    res.status(statusCode).json({
        status: statusCode,
        message,
        message_type,
    });
};

export default errorHandler;
