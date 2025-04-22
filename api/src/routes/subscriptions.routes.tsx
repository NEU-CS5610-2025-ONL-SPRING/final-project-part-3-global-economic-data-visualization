import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middlewares/requireAuth.js';

const prisma = new PrismaClient();
const router = Router();

interface SubscriptionItem {
    id: number;
    user_id: number;
    indicator_id: number;
    country_code: string;
    note?: string | null;
    created_at: Date;
    updated_at: Date;
}

interface CreateSubscriptionBody {
    indicator_id: number;
    country_code: string;
    note?: string;
}

interface UpdateSubscriptionBody {
    country_code?: string;
    note?: string;
}

interface SubscriptionResponse {
    message?: string;
    error?: string;
    subscription?: SubscriptionItem;
}

// Validate ID as a positive integer
const isValidId = (id: string): boolean => {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0;
};

// Validate country code (ISO 3166-1 alpha-2, e.g., "US")
const isValidCountryCode = (code: string): boolean => {
    const countryCodeRegex = /^[A-Z]{2}$/;
    return countryCodeRegex.test(code);
};

// Validate note (e.g., max 500 characters, no dangerous characters)
const isValidNote = (note: string | undefined): boolean => {
    if (!note) return true;
    return note.length <= 500 && /^[A-Za-z0-9\s,.!?()-]*$/.test(note);
};

/**
 * GET /api/subscriptions
 * Fetch all subscriptions for the authenticated user
 */
router.get<
    Record<string, never>,
    SubscriptionItem[] | { error: string }
>('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId as number;
        const subscriptions = await prisma.subscription.findMany({
            where: { user_id: userId },
        });
        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/subscriptions/:id
 * Fetch a specific subscription by ID, ensuring user ownership
 */
router.get<
    { id: string },
    SubscriptionItem | { error: string }
>('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!isValidId(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }

    try {
        const userId = req.userId as number;
        const subscriptionId = parseInt(id, 10);
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        if (subscription.user_id !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        res.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/subscriptions
 * Create a new subscription for the authenticated user
 */
router.post<
    Record<string, never>,
    SubscriptionResponse,
    CreateSubscriptionBody
>('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { indicator_id, country_code, note } = req.body;

    if (!indicator_id || !country_code) {
        res.status(400).json({ error: 'indicator_id and country_code are required' });
        return;
    }

    if (!isValidId(indicator_id.toString())) {
        res.status(400).json({ error: 'Invalid indicator_id format' });
        return;
    }
    if (!isValidCountryCode(country_code)) {
        res.status(400).json({ error: 'Invalid country_code format (must be ISO 3166-1 alpha-2, e.g., US)' });
        return;
    }
    if (!isValidNote(note)) {
        res.status(400).json({ error: 'Invalid note format (max 500 characters, alphanumeric and basic punctuation)' });
        return;
    }

    try {
        const userId = req.userId as number;

        // Validate indicator existence
        const indicator = await prisma.indicator.findUnique({
            where: { id: indicator_id },
        });
        if (!indicator) {
            res.status(400).json({ error: 'Indicator does not exist' });
            return;
        }

        // Check for existing subscription
        const existing = await prisma.subscription.findFirst({
            where: { user_id: userId, indicator_id },
        });
        if (existing) {
            res.status(400).json({ error: 'You already subscribed to this indicator' });
            return;
        }

        const newSub = await prisma.subscription.create({
            data: {
                user_id: userId,
                indicator_id,
                country_code,
                note: note ?? null,
            },
        });

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription: newSub,
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /api/subscriptions/:id
 * Update a subscription, ensuring user ownership
 */
router.put<
    { id: string },
    SubscriptionResponse,
    UpdateSubscriptionBody
>('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { country_code, note } = req.body;

    if (!isValidId(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    if (country_code && !isValidCountryCode(country_code)) {
        res.status(400).json({ error: 'Invalid country_code format (must be ISO 3166-1 alpha-2, e.g., US)' });
        return;
    }
    if (!isValidNote(note)) {
        res.status(400).json({ error: 'Invalid note format (max 500 characters, alphanumeric and basic punctuation)' });
        return;
    }

    try {
        const userId = req.userId as number;
        const subscriptionId = parseInt(id, 10);
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        if (subscription.user_id !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const updated = await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                country_code: country_code ?? subscription.country_code,
                note: note ?? subscription.note,
            },
        });

        res.json({
            message: 'Subscription updated successfully',
            subscription: updated,
        });
    } catch (error: any) {
        console.error('Error updating subscription:', error);
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /api/subscriptions/:id
 * Delete a subscription, ensuring user ownership
 */
router.delete<
    { id: string },
    { message?: string; error?: string }
>('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!isValidId(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }

    try {
        const userId = req.userId as number;
        const subscriptionId = parseInt(id, 10);
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        if (subscription.user_id !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        await prisma.subscription.delete({
            where: { id: subscriptionId },
        });

        res.json({ message: 'Subscription deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting subscription:', error);
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Disconnect Prisma client on application termination
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
});

export default router;