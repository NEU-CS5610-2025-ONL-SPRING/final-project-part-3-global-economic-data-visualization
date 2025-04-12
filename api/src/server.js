import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'

const app = express()
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use('/api', routes)

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server is listening on port ${PORT}`)
})