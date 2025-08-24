import Hotel from "../models/Hotel.js"; // Added .js extension
import User from "../models/User.js";   // Added .js extension

export const registerHotel = async (req, res) => {
     try {
          const { name, address, contact, city } = req.body;
          const owner = req.user._id;

          // Check if user is already registered
          const hotel = await Hotel.findOne({ owner });
          if (hotel) {
            return res.status(400).json({ success: false, message: "Hotel already registered" });
          }

          await Hotel.create({ name, address, contact, city, owner });

          await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

          res.status(201).json({ success: true, message: "Hotel registered successfully" });
     } catch (error) {
         res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
     }
}