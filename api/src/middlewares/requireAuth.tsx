import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

interface JwtPayload {
    userId: number;
    iat: number;
    exp: number;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ error: 'Unauthorized - no token' });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ error: 'Internal server error - missing JWT_SECRET' });
            return;
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (!decoded.userId || typeof decoded.userId !== 'number') {
            res.status(401).json({ error: 'Unauthorized - invalid token payload' });
            return;
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Unauthorized - token expired' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Unauthorized - invalid token' });
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    }
}