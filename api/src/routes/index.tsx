import { Router, Request, Response, NextFunction } from 'express';
import authRoutes from './auth.routes.js';
import indicatorsRoutes from './indicators.routes.js';
import subscriptionsRoutes from './subscriptions.routes.js';
import worldbankRoutes from './worldbank.routes.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const router = Router();

// Enable CORS for all routes
router.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Configure allowed origins in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Apply rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later' },
});
router.use(limiter);

router.use('/auth', authRoutes);
router.use('/indicators', indicatorsRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/worldbank', worldbankRoutes);

/**
 * GET /ping
 * Health check endpoint to verify API is running
 */
router.get('/ping', (req: Request, res: Response) => {
    res.send('pong');
});

// Handle 404 errors for undefined routes
router.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

export default router;