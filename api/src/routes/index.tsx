import express, { Router, Request, Response, NextFunction } from 'express'
import authRoutes from './auth.routes.js'
import indicatorsRoutes from './indicators.routes.js'
import subscriptionsRoutes from './subscriptions.routes.js'
import worldbankRoutes from './worldbank.routes.js'
import usersRoutes from './users.routes.js'
import worldbankSeriesRoutes from './worldbankSeries.routes.js'
import worldbankImportRoutes from './worldbankImport.router.js'

import cors from 'cors'
import rateLimit from 'express-rate-limit'

const router = express.Router();

router.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' },
})
router.use(limiter)

router.use('/auth', authRoutes)
router.use('/indicators', indicatorsRoutes)
router.use('/subscriptions', subscriptionsRoutes)
router.use('/worldbank', worldbankRoutes)
router.use('/users', usersRoutes)
router.use('/data/wbseries', worldbankSeriesRoutes)
router.use('/worldbank-import', worldbankImportRoutes)

router.get('/ping', (req: Request, res: Response) => {
    res.send('pong')
})

router.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' })
})

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
})

export default router