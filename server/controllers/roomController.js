import Hotel from "../models/Hotel.js"; // Fixed: Changed from 'hotel' to 'Hotel' and capitalized variable name
import { v2 as cloudinary } from "cloudinary";  
import Room from "../models/Room.js";

//API to create a new room for hotel

export const createRoom = async (req, res) => {
       try {
           const { roomType, pricePerNight, amenities} = req.body;
           const hotel = await Hotel.findOne({owner: req.auth.userId}) // Fixed: Using Hotel instead of hotel
           
           if(!hotel) return res.json({ success: false, message: "Hotel not found"})

            // Upload images to Cloudinary and get URLs
            const uploadImages = req.files.map(async (file) => {
                const response = await cloudinary.uploader.upload(file.path);
                return response.secure_url;
            })

           //Wait for all uploads to complete
            const images = await Promise.all(uploadImages)

            await Room.create({
                hotel: hotel._id,
                roomType,
                pricePerNight: +pricePerNight,
                amenities: JSON.parse(amenities),
                images,
            })
            res.json({ success: true, message: "Room created successfully"})
        } catch (error) {
            res.status(500).json({ success: false, message: error.message})
       }
}

//API to get all rooms

export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({isAvailable: true}).populate({path: 'hotel', // Fixed: Added 'const rooms ='
            populate:{
                path: 'owner',
                select: 'image'
            }
        }).sort({ createdAt: -1 }) // Fixed: Changed 'createAt' to 'createdAt'
        res.json({ success: true, rooms })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message}) 
    }
}

//API to get all rooms for a specific hotel

export const getOwnerRooms = async (req, res) => {
    try {
         const hotelData = await Hotel.findOne({owner: req.auth.userId}) // Fixed: Changed Hotel() to Hotel.findOne()
         const rooms = await Room.find({hotel: hotelData._id.toString()}).populate("hotel");
         res.json({ success: true, rooms })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message}) 
    }
}

//API to toggle availability of a room

export const toggleRoomAvailability = async (req, res) => {
    try {
         const { roomId } = req.body;
         const roomData = await Room.findById(roomId);
         roomData.isAvailable = !roomData.isAvailable;
         await roomData.save();
            res.json({ success: true, message: "Room availability updated"})
    } catch (error) {
        res.status(500).json({ success: false, message: error.message})
    }
}