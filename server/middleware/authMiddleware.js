import { getAuth } from '@clerk/express';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found in DB' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Protect error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
