import express from 'express'
import cors from 'cors'
import { chatbotRoutes } from './routes/chatbot.js'

// Standalone runner for developing this feature in isolation. The real app
// mounts chatbotRoutes() straight into server/gateway.js instead.
const app = express()
const PORT = process.env.PORT || 4020

app.use(cors())
app.use(express.json({ limit: '20kb' }))

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/chatbot', chatbotRoutes())

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } })
})

app.listen(PORT, () => {
  console.log(`Chatbot API listening on http://localhost:${PORT}`)
})
