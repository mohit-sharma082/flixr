import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
    user?: any;
}

export default async function auth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token provided' });
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
        return res.status(401).json({ error: 'Invalid token format' });

    const token = parts[1];
    try {
        const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await User.findById(payload.id).select('-password');
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalid' });
    }
}
