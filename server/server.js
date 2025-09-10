// server.js
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import clerkWebhooks from './controllers/clerkWebhooks.js';
import userRouter from './routes/userRoutes.js';
import { clerkMiddleware } from '@clerk/express';

const startServer = async () => {
  await connectDB();

  const app = express();
  app.use(cors());

  // Clerk webhook route first (raw body)
  app.use('/api/clerk', clerkWebhooks);

  // Normal middlewares
  app.use(express.json());

  app.get('/', (req, res) => res.send('API is working'));

  // Authenticated routes
  app.use('/api/user', clerkMiddleware(), userRouter);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
