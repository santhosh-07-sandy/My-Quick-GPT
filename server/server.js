import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import creditRouter from './routes/creditRoutes.js'
import { stripeWebhooks } from './controllers/webhooks.js'

const app = express()

await connectDB()

// Stripe Webhooks - Must be before body parser
app.post('/api/stripe',
  // Handle raw body for webhook verification
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Store the raw body as a buffer for webhook verification
    req.rawBody = req.body;
    next();
  },
  stripeWebhooks
)

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack)
  res.status(500).json({ success: false, message: "Something went wrong! Internal Server Error" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})