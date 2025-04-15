import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middlewares/requireAuth.js'

const prisma = new PrismaClient()
const router = Router()

interface SubscriptionItem {
    id: number
    user_id: number
    indicator_id: number
    country_code: string
    note?: string | null
    created_at: Date
    updated_at: Date
}


interface CreateSubscriptionBody {
    indicator_id: number
    country_code: string
    note?: string
}

interface UpdateSubscriptionBody {
    country_code?: string
    note?: string
}


interface SubscriptionResponse {
    message?: string
    error?: string
    subscription?: SubscriptionItem
}

/**
 * GET /api/subscriptions
 */
router.get<
    Record<string, never>,
    SubscriptionItem[] | { error: string }
>('/', requireAuth, async (
    req: Request<Record<string, never>, SubscriptionItem[] | { error: string }, any>,
    res: Response<SubscriptionItem[] | { error: string }>
): Promise<void> => {
    try {
        const userId = req.userId as number
        const subscriptions = await prisma.subscription.findMany({
            where: { user_id: userId },
        })
        res.json(subscriptions)
        return
    } catch (error) {
        console.error('Error fetching subscriptions:', error)
        res.status(500).json({ error: 'Internal server error' })
        return
    }
})

/**
 * GET /api/subscriptions/:id
 */
router.get<
    { id: string },
    SubscriptionItem | { error: string }
>('/:id', requireAuth, async (
    req: Request<{ id: string }, SubscriptionItem | { error: string }, any>,
    res: Response<SubscriptionItem | { error: string }>
): Promise<void> => {
    try {
        const userId = req.userId as number
        const subscriptionId = parseInt(req.params.id, 10)

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            // include: { indicator: true },
        })

        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' })
            return
        }
        if (subscription.user_id !== userId) {
            res.status(403).json({ error: 'Forbidden' })
            return
        }

        res.json(subscription)
        return
    } catch (error) {
        console.error('Error fetching subscription:', error)
        res.status(500).json({ error: 'Internal server error' })
        return
    }
})

/**
 * POST /api/subscriptions
 */
router.post<
    Record<string, never>,     // path params = none
    SubscriptionResponse,      // response body
    CreateSubscriptionBody     // request body
>('/', requireAuth, async (
    req: Request<Record<string, never>, SubscriptionResponse, CreateSubscriptionBody>,
    res: Response<SubscriptionResponse>
): Promise<void> => {
    try {
        const userId = req.userId as number
        const { indicator_id, country_code, note } = req.body

        if (!indicator_id || !country_code) {
            res.status(400).json({ error: 'indicator_id and country_code are required' })
            return
        }

        const indicator = await prisma.indicator.findUnique({
            where: { id: indicator_id },
        })
        if (!indicator) {
            res.status(400).json({ error: 'Indicator does not exist' })
            return
        }

        //Check if there is already subscription.
        const existing = await prisma.subscription.findFirst({
            where: { user_id: userId, indicator_id }})
        if (existing) {
            res.status(400).json({ error: 'You already subscribed this indicator' })
            return
        }

        const newSub = await prisma.subscription.create({
            data: {
                user_id: userId,
                indicator_id,
                country_code,
                note: note ?? null,
            }
        })

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription: newSub
        })
        return
    } catch (error: any) {
        console.error('Error creating subscription:', error)
        res.status(500).json({ error: 'Internal server error' })
        return
    }
})

/**
 * PUT /api/subscriptions/:id
 * update subscription
 */
router.put<
    { id: string },             // path params
    SubscriptionResponse,       // response body
    UpdateSubscriptionBody      // request body
>('/:id', requireAuth, async (
    req: Request<{ id: string }, SubscriptionResponse, UpdateSubscriptionBody>,
    res: Response<SubscriptionResponse>
): Promise<void> => {
    try {
        const userId = req.userId as number
        const subscriptionId = parseInt(req.params.id, 10)
        const { country_code, note } = req.body

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        })
        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' })
            return
        }
        if (subscription.user_id !== userId) {
            res.status(403).json({ error: 'Forbidden' })
            return
        }

        const updated = await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                country_code: country_code ?? subscription.country_code,
                note: note ?? subscription.note,
            }
        })

        res.json({
            message: 'Subscription updated successfully',
            subscription: updated,
        })
        return
    } catch (error: any) {
        console.error('Error updating subscription:', error)
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Subscription not found' })
            return
        }
        res.status(500).json({ error: 'Internal server error' })
        return
    }
})

/**
 * DELETE /api/subscriptions/:id
 * delete subscriptions
 */
router.delete<
    { id: string },
    { message?: string; error?: string } // response body
>('/:id', requireAuth, async (
    req: Request<{ id: string }, { message?: string; error?: string }, any>,
    res: Response<{ message?: string; error?: string }>
): Promise<void> => {
    try {
        const userId = req.userId as number
        const subscriptionId = parseInt(req.params.id, 10)

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        })
        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' })
            return
        }
        if (subscription.user_id !== userId) {
            res.status(403).json({ error: 'Forbidden' })
            return
        }

        await prisma.subscription.delete({
            where: { id: subscriptionId },
        })

        res.json({ message: 'Subscription deleted successfully' })
        return
    } catch (error: any) {
        console.error('Error deleting subscription:', error)
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Subscription not found' })
            return
        }
        res.status(500).json({ error: 'Internal server error' })
        return
    }
})

export default router
