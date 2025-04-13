import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.routes.js'
import indicatorsRoutes from './routes/indicators.routes.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/indicators', indicatorsRoutes)


app.get('/ping', (req, res) => {
  res.send('pong')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server is listening on port ${PORT}`)
})