// server.js
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';
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

  // Basic route
  app.get('/', (req, res) => res.send('API is working'));

  // Test endpoint with simple mongoose check
  app.get('/api/test', (req, res) => {
    console.log('🚀 Test API endpoint called!');
    
    try {
      const mongoState = mongoose.connection.readyState;
      const isConnected = mongoState === 1;
      
      console.log('🔍 Mongoose state:', mongoState, 'Connected:', isConnected);
      
      res.json({
        success: true,
        message: 'Backend API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongoConnected: isConnected,
        mongoState: mongoState,
        connectionName: mongoose.connection.name
      });
    } catch (error) {
      console.log('❌ Mongoose error:', error);
      res.json({
        success: true,
        message: 'Backend API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongoConnected: false,
        error: error.message
      });
    }
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