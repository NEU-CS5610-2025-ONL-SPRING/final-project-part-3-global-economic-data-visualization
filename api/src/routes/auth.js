import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

router.post('/register', async (req, res) => {
    try{
        const { email, password, username } = req.body

        if(!email || !password || !username){
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: req.body.email },
                    { username: req.body.username }
                ],
            },
        }) 

        if(existingUser){
            return res.status(400).json({ error: 'User or email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: { email, password_hash: hashedPassword, username },
        })

        res.json({ message: 'User created successfully', userId: newUser.id })
    } catch (error) {
        console.error('Error registering user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body

        if(!email || !password){
            return res.status(400).json({ error: 'Missing required fields' })
        }
        
        const user = await prisma.user.findUnique({
            where: { email }
          })
          if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
          }
        
        const match = await bcrypt.compare(password, user.password_hash)
          if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' })
          }


        const secret = process.env.JWT_SECRET
        const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' })

        jwt.verify(token, secret)

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000,
        })

        res.json({ message: 'Login successful', userId: user.id })
    } catch (error) {
        console.error('Error logging in:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/logout', async (req, res) => {
    res.clearCookie('token')
    res.json({ message: 'Logout successful' })
})

export default router


