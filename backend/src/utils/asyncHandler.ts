import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wrap async route handlers to forward errors to express error handler
export const asyncHandler =
    (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);
