import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { protect } from '../middleware/authMiddleware.js';
import { registerHotel } from '../controllers/hotelController.js';

const hotelRouter = express.Router();   

hotelRouter.post('/', registerHotel); 

export default hotelRouter;