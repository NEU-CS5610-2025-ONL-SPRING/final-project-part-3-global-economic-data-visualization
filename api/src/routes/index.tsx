import { Router } from 'express'
import authRoutes from './auth.routes.js'
import indicatorsRoutes from './indicators.routes.js'
import subscriptionsRoutes from './subscriptions.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/indicators', indicatorsRoutes)
router.use('/subscriptions', subscriptionsRoutes)

router.get('/ping', (req, res) => {
    res.send('pong')
})

export default router