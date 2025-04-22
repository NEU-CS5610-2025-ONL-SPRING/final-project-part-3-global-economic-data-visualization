import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middlewares/requireAuth.js'
import bcrypt from 'bcrypt'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /api/users/me
 * get all user information except password
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                created_at: true,
                updated_at: true
            }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error('GET /me error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PUT /api/users/me
 * update current user credentials
 */
router.put('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { username, email, password } = req.body

        let updateData: any = {}
        if (username) updateData.username = username
        if (email) updateData.email = email

        if (password) {
            if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
                return res.status(400).json({ error: 'Password must be at least 8 chars, with letters and numbers' })
            }
            const hashedPassword = await bcrypt.hash(password, 10)
            updateData.password_hash = hashedPassword
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                created_at: true,
                updated_at: true
            }
        })

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        })
    } catch (error: any) {
        console.error('PUT /me error:', error)

        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Username or email already exists' })
        }

        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
