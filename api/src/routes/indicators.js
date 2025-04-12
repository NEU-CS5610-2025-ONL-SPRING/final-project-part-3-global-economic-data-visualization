import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middlewares/requireAuth.js'

const prisma = new PrismaClient()
const router = Router()

router.get('/', async (req, res) => {
  try {
    const indicators = await prisma.indicator.findMany()
    res.json(indicators)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { code, name, description } = req.body
    if (!code || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const newIndicator = await prisma.indicator.create({
      data: { code, name, description }
    })
    res.json({ message: 'Indicator created', indicator: newIndicator })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
