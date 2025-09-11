// server.js
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';  // Add this line
import connectDB from './configs/db.js';
import clerkWebhooks from './controllers/clerkWebhooks.js';
import userRouter from './routes/userRoutes.js';
import { clerkMiddleware } from '@clerk/express';

const startServer = async () => {
  // Connect to database first
  await connectDB();
  
  // Wait a moment to ensure connection is established
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verify connection before starting server
  console.log('Final connection state:', mongoose.connection.readyState);

  const app = express();
  app.use(cors());

  // Clerk webhook route first (raw body)
  app.use('/api/clerk', clerkWebhooks);

  // Normal middlewares
  app.use(express.json());

  // Basic route
  app.get('/', (req, res) => res.send('API is working'));

  // Test and health check endpoints
  app.get('/api/test', (req, res) => {
    console.log('🚀 Test API endpoint called!');
    res.json({
      success: true,
      message: 'Backend API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      mongoConnected: !!global.mongoose?.connection?.readyState
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Authenticated routes
  app.use('/api/user', clerkMiddleware(), userRouter);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();