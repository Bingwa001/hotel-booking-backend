// userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';  // Add .js extension
import { getUserData, storeRecentSearchedCities } from '../controllers/UserController.js';

const userRouter = express.Router();

userRouter.get('/', protect, getUserData);
userRouter.post('/recent-cities', protect, storeRecentSearchedCities);

export default userRouter;