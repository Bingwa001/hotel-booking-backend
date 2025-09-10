import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
     try {
          console.log("=== Hotel Registration Started ===");
          console.log("Request body:", req.body);
          console.log("Request user:", req.user);

          const { name, address, contact, city } = req.body;
          console.log("Extracted fields:", { name, address, contact, city });

          // Check if req.user exists
          if (!req.user || !req.user._id) {
               console.log("ERROR: No user found in request");
               return res.status(401).json({ success: false, message: "Authentication required" });
          }

          const owner = req.user._id;
          console.log("Owner ID:", owner);

          // Check if user is already registered
          console.log("Checking for existing hotel...");
          const hotel = await Hotel.findOne({ owner });
          console.log("Existing hotel found:", hotel);
          
          if (hotel) {
            console.log("Hotel already exists, returning error");
            return res.status(400).json({ success: false, message: "Hotel already registered" });
          }

          console.log("Creating new hotel...");
          const newHotel = await Hotel.create({ name, address, contact, city, owner });
          console.log("Hotel created successfully:", newHotel);

          console.log("Updating user role...");
          const updatedUser = await User.findByIdAndUpdate(owner, { role: "hotelOwner" });
          console.log("User role updated:", updatedUser);

          console.log("Sending success response");
          res.status(201).json({ success: true, message: "Hotel registered successfully" });
          
     } catch (error) {
          console.error("=== ERROR in registerHotel ===");
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Full error:", error);
          console.error("Stack trace:", error.stack);
          
         res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
     }
}