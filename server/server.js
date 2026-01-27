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
    // Store the raw body for webhook verification
    req.rawBody = req.body.toString('utf8');
    next();
  },
  stripeWebhooks
)

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res)=> res.send('Server is Live!'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})