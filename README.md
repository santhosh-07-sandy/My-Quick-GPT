# My-QuickGPT 🤖

A modern, full-stack AI chat application built with React and Node.js, featuring credit-based usage, Stripe payments, and real-time AI interactions.

## 🌟 Features

- **AI Chat Interface**: Interactive chat with OpenAI GPT models
- **Credit System**: Pay-per-use model with credit purchases
- **User Authentication**: Secure JWT-based authentication
- **Payment Integration**: Stripe for credit purchases
- **Responsive Design**: Mobile-friendly with Tailwind CSS
- **Dark Mode Support**: Built-in dark theme
- **Real-time Updates**: Live credit balance updates
- **Code Highlighting**: Syntax highlighting for code responses
- **Community Features**: Share and explore AI-generated content

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS 4.1.12** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **React Markdown** - Markdown rendering
- **Prism.js** - Code syntax highlighting

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing
- **OpenAI** - AI model integration
- **ImageKit** - Image management

## 📁 Project Structure

```
My-QuickGPT/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── assets/         # Static assets
│   │   └── App.jsx         # Main App component
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── configs/           # Configuration files
│   └── server.js          # Server entry point
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Stripe account (for payments)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/My-QuickGPT.git
   cd My-QuickGPT
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**

   Create `.env` files in both `client` and `server` directories:

   **Server `.env`**:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/quickgpt
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # ImageKit (optional)
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

   **Client `.env`**:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

5. **Start the development servers**

   **Backend server** (in `server` directory):
   ```bash
   npm run server
   ```

   **Frontend dev server** (in `client` directory):
   ```bash
   npm run dev
   ```

   The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📖 API Documentation

### Authentication Routes
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/data` - Get user data (protected)

### Credit Routes
- `GET /api/credit/plan` - Get available credit plans
- `POST /api/credit/purchase` - Purchase credits (protected)

### Chat Routes
- `POST /api/chat/ask` - Send message to AI
- `GET /api/chat/history` - Get chat history

### Message Routes
- `GET /api/message/published` - Get published messages

### Webhooks
- `POST /api/stripe` - Stripe webhook handler

## 💳 Credit Plans

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Basic | $10 | 100 | 100 text generations, 50 image generations |
| Pro | $20 | 500 | 500 text generations, 200 image generations |
| Premium | $30 | 1000 | 1000 text generations, 500 image generations |

## 🔧 Configuration

### Stripe Setup

1. Create a Stripe account
2. Get your API keys from the Stripe Dashboard
3. Set up webhooks for payment completion
4. Configure webhook endpoint: `https://yourdomain.com/api/stripe`

### OpenAI Setup

1. Create an OpenAI account
2. Generate an API key
3. Add the key to your server `.env` file

### MongoDB Setup

1. Set up MongoDB (local or cloud)
2. Create a database named `quickgpt`
3. Add the connection string to your server `.env` file

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
3. Add environment variables

### Backend (Vercel/Heroku)

1. Deploy the server directory
2. Configure environment variables
3. Set up Stripe webhooks for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Stripe Payment Issues**
   - Verify webhook endpoint is accessible
   - Check Stripe webhook secret

3. **OpenAI API Errors**
   - Verify API key is valid
   - Check API usage limits

4. **CORS Issues**
   - Ensure frontend URL is allowed in CORS settings

### Debug Mode

Set `NODE_ENV=development` in your server `.env` to enable detailed error logging.

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

## 🎯 Roadmap

- [ ] Add more AI models
- [ ] Implement team features
- [ ] Add analytics dashboard
- [ ] Mobile app development
- [ ] API rate limiting
- [ ] Advanced user roles
- [ ] Custom themes
- [ ] Export chat history

---

**Built with ❤️ by [Your Name]**
