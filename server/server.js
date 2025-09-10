// server.js
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from './controllers/clerkWebhooks.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import roomRouter from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';

// Connect to DB and Cloudinary first
connectDB();
connectCloudinary();

const app = express();

// CORS
app.use(cors());

// ---- Clerk Webhook route FIRST (raw body) ----
app.use('/api/clerk', clerkWebhooks);

// ---- Normal middlewares ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Root route ----
app.get('/', (req, res) => res.send('API is working'));

// ---- Authenticated routes ----
app.use('/api/user', clerkMiddleware(), userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);

// ❌ DO NOT call app.listen() on Vercel
// ✅ Instead export the app for Vercel
export default app;
