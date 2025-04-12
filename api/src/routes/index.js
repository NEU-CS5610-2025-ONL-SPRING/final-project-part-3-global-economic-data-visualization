import { Router } from 'express'
import authRoutes from './auth.js'
import indicatorsRoutes from './indicators.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/indicators', indicatorsRoutes)

router.get('/ping', (req, res) => { res.send('pong') })

export default router
