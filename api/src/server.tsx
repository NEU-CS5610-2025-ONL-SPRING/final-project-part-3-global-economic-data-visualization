import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.routes.js'
import indicatorsRoutes from './routes/indicators.routes.js'
import subscriptionRoutes from "./routes/subscriptions.routes.js"
import worldbankRoutes from "./routes/worldbank.routes.js"
import usersRoutes from "./routes/users.routes.js"
import worldbankSeriesRoutes from './routes/worldbankSeries.routes.js'
import worldbankImportRoutes from './routes/worldbankImport.router.js'
import router from "./routes/auth.routes.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({
  origin: true,
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.use('/api', router)
app.use('/api/auth', authRoutes)
app.use('/api/indicators', indicatorsRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/worldbank', worldbankRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/worldbankSeries', worldbankSeriesRoutes)
app.use('/api/worldbank-import', worldbankImportRoutes)

app.get('/ping', (req, res) => {
  res.send('pong')
})

const root = path.join(__dirname, '../client-dist')
app.use(express.static(root))

app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server is listening on port ${PORT}`)
})