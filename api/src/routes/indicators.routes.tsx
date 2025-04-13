import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middlewares/requireAuth.js'

const prisma = new PrismaClient()
const router = Router()

interface IndicatorItem {
    id: number
    code: string
    name: string
    description?: string | null
}

interface CreateOrUpdateIndicatorBody {
    code: string
    name: string
    description?: string
}

interface IndicatorResponse {
    message?: string
    error?: string
    indicator?: IndicatorItem
}

/**
 * GET /api/indicators
 */
router.get<
    Record<string, never>,
    IndicatorItem[] | { error: string }
>('/', async (req, res) => {
    try {
        const indicators = await prisma.indicator.findMany()
        res.json(indicators)
    } catch (error) {
        console.error('Error fetching indicators:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/indicators/:id
 */
router.get<
    { id: string },
    IndicatorItem | { error: string }
>('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const indicatorId = parseInt(id, 10)
        const indicator = await prisma.indicator.findUnique({
            where: { id: indicatorId }
        })

        if (!indicator) {
            res.status(404).json({ error: 'Indicator not found' })
            return
        }

        res.json(indicator)
    } catch (error) {
        console.error('Error fetching indicator:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/indicators
 */
router.post<
    Record<string, never>,   // path params = none
    IndicatorResponse,       // response
    CreateOrUpdateIndicatorBody // request body
>('/', requireAuth, async (req, res) => {
    const { code, name, description } = req.body

    if (!code || !name) {
        res.status(400).json({ error: 'code and name are required' })
        return
    }

    try {
        const newIndicator = await prisma.indicator.create({
            data: { code, name, description }
        })

        res.status(201).json({
            message: 'Indicator created successfully',
            indicator: newIndicator
        })
    } catch (error: any) {
        console.error('Error creating indicator:', error)

        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Indicator code already exists' })
            return
        }

        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PUT /api/indicators/:id
 */
router.put<
    { id: string },
    IndicatorResponse,
    Partial<CreateOrUpdateIndicatorBody>
>('/:id', requireAuth, async (req, res) => {
    const { id } = req.params
    const { code, name, description } = req.body

    try {
        const indicatorId = parseInt(id, 10)
        const updated = await prisma.indicator.update({
            where: { id: indicatorId },
            data: { code, name, description }
        })

        res.json({
            message: 'Indicator updated successfully',
            indicator: updated
        })
    } catch (error: any) {
        console.error('Error updating indicator:', error)

        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Indicator not found' })
            return
        } else if (error.code === 'P2002') {
            res.status(400).json({ error: 'Indicator code already exists' })
            return
        }

        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * DELETE /api/indicators/:id
 */
router.delete<
    { id: string },
    { message?: string; error?: string }
>('/:id', requireAuth, async (req, res) => {
    const { id } = req.params

    try {
        const indicatorId = parseInt(id, 10)
        await prisma.indicator.delete({
            where: { id: indicatorId }
        })

        res.json({ message: 'Indicator deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting indicator:', error)

        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Indicator not found' })
            return
        }

        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router