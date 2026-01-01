//  =====================================================================================================================================================================================

//  File Name: error_handler.ts

//  Description: Error handler middleware. Centralized error handling for Express applications with proper error responses.

 

//  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//  Item Name: Whizrange

//  Author URL: https://whizhack.in

 

//  =====================================================================================================================================================================================

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
    const error = err as { status?: number; message?: string; response?: { data?: any } };

    console.error(`\nError ~>`, error?.response?.data || error?.message || "Unknown error");

    // Default error message and status code
    const statusCode = error?.status || 500;
    const message = error?.message || "INTERNAL SERVER ERROR";
    const message_type = "INTERNAL_SERVER_ERROR";

    res.status(statusCode).json({
        status: statusCode,
        message,
        message_type,
    });
};

export default errorHandler;
