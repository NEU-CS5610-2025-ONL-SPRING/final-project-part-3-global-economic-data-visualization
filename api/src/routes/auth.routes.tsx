import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

interface RegisterRequestBody {
    email: string;
    password: string;
    username: string;
}

interface RegisterResponseBody {
    message?: string;
    error?: string;
    userId?: number;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

interface LoginResponseBody {
    message?: string;
    error?: string;
    userId?: number;
}

// validate email address format
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// password strength validation
const isValidPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
};

/**
 * POST /register
 */
router.post<
    Record<string, never>,
    RegisterResponseBody,
    RegisterRequestBody
>('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password || !username) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        if (!isValidEmail(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }

        if (!isValidPassword(password)) {
            res.status(400).json({ error: 'Password must be at least 8 characters long and include letters and numbers' });
            return;
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existingUser) {
            res.status(400).json({ error: 'User or email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { email, password_hash: hashedPassword, username },
        });

        res.json({ message: 'User created successfully', userId: newUser.id });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /login
 */
router.post<
    Record<string, never>,
    LoginResponseBody,
    LoginRequestBody
>('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        if (!isValidEmail(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ error: 'Internal server error - missing JWT_SECRET' });
            return;
        }

        const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000,
        });

        res.json({ message: 'Login successful', userId: user.id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /logout
 */
router.post('/logout', (req: Request, res: Response): void => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
});

// disconnect prisma when it ends.
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
});

export default router;