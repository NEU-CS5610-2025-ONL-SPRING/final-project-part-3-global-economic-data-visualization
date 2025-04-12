import jwt from 'jsonwebtoken'

export const requireAuth = (req, res, next) => {
    try{
        const token = req.cookies?.token

        if(!token){
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const secret = process.env.JWT_SECRET

        jwt.verify(token, secret)
        req.userId = secret.userId
        next()
    } catch (error) {
        console.error('Error verifying token:', error)
        res.status(401).json({ error: 'Unauthorized' })
    }
}
