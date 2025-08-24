import express from 'express';
import "dotenv/config";
import cors from 'cors';  
import connectDB from './configs/db.js';   
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from './controllers/clerkWebhooks.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';

connectDB()

const app = express();
app.use(cors());

// IMPORTANT: Raw body parsing for webhooks BEFORE express.json()
app.use('/api/clerk', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(clerkMiddleware());

// Create proper route
app.post("/api/clerk/webhooks", clerkWebhooks);
app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});