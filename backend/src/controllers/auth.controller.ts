import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User';

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().allow('', null),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const register = async (req: Request, res: Response) => {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { email, password, name } = value;
    const existing = await User.findOne({ email });
    if (existing)
        return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, name });
    await user.save();

    const token = (jwt as any)?.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
    );
    res.json({
        token,
        user: { id: user._id, email: user.email, name: user.name },
    });
};

export const login = async (req: Request, res: Response) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = (jwt as any)?.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
    );
    res.json({
        token,
        user: { id: user._id, email: user.email, name: user.name },
    });
};
