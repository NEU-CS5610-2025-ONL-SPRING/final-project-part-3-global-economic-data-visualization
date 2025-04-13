import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

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
        const token = req.cookies?.token
        if (!token) {
            res.status(401).json({ error: 'Unauthorized - no token' })
            return
        }

        const secret = process.env.JWT_SECRET as string

        const decoded = jwt.verify(token, secret) as JwtPayload

        req.userId = decoded.userId

        next()
    } catch (error) {
        console.error('Error verifying token:', error)
        res.status(401).json({ error: 'Unauthorized' })
        return
    }
}