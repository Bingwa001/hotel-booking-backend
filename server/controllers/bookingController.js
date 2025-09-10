import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// Function to check availability of room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        // Find overlapping bookings - a room is unavailable if there are any bookings that overlap
        const bookings = await Booking.find({
            room,
            $or: [
                // Case 1: Existing booking starts before or during our stay and ends after our check-in
                {
                    checkInDate: { $lt: checkOutDate },
                    checkOutDate: { $gt: checkInDate }
                }
            ]
        });
        
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

// API to check availability of room 
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        
        // Input validation
        if (!room || !checkInDate || !checkOutDate) {
            return res.json({ success: false, message: "Room, check-in date, and check-out date are required" });
        }
        
        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkIn >= checkOut) {
            return res.json({ success: false, message: "Check-out date must be after check-in date" });
        }
        
        if (checkIn < today) {
            return res.json({ success: false, message: "Check-in date cannot be in the past" });
        }
        
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({ success: true, isAvailable });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to create a new booking
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id; // Fixed capitalization
        
        // Input validation
        if (!room || !checkInDate || !checkOutDate || !guests) {
            return res.json({ success: false, message: "All fields are required" });
        }
        
        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkIn >= checkOut) {
            return res.json({ success: false, message: "Check-out date must be after check-in date" });
        }
        
        if (checkIn < today) {
            return res.json({ success: false, message: "Check-in date cannot be in the past" });
        }
        
        // Validate guests
        if (guests <= 0) {
            return res.json({ success: false, message: "Number of guests must be greater than 0" });
        }
        
        // Before booking, check availability
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room
        });

        if (!isAvailable) {
            return res.json({ success: false, message: "Room is not available for the selected dates" });
        }

        // Get room data and verify room exists
        const roomData = await Room.findById(room).populate("hotel");
        if (!roomData) {
            return res.json({ success: false, message: "Room not found" });
        }
        
        // Check if number of guests exceeds room capacity
        if (guests > roomData.capacity) {
            return res.json({ success: false, message: `Room capacity is ${roomData.capacity} guests` });
        }
        
        // Calculate total price based on nights
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const totalPrice = roomData.pricePerNight * nights;
        
        // Create booking
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id, // Fixed capitalization
            guests: parseInt(guests),
            checkInDate,
            checkOutDate,
            totalPrice,
        });
        
        res.json({ 
            success: true, 
            message: "Booking created successfully",
            booking: {
                id: booking._id,
                totalPrice,
                nights
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to create booking" });
    }
};

// API to get all bookings for user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user })
            .populate("room hotel")
            .sort({ createdAt: -1 });
            
        res.json({ success: true, bookings });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to fetch bookings" });
    }
}

// API to get hotel bookings and dashboard data
// GET /api/bookings/hotel
export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        
        if (!hotel) {
            return res.json({ success: false, message: "No hotel found for this user" });
        }
        
        const bookings = await Booking.find({ hotel: hotel._id }) // Fixed typo
            .populate("room hotel user")
            .sort({ createdAt: -1 });
            
        // Calculate dashboard metrics
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
        
        // Additional metrics
        const currentDate = new Date();
        const upcomingBookings = bookings.filter(booking => 
            new Date(booking.checkInDate) > currentDate
        ).length;
        
        const completedBookings = bookings.filter(booking => 
            new Date(booking.checkOutDate) < currentDate
        ).length;

        res.json({ 
            success: true, 
            dashboardData: {
                totalBookings,
                totalRevenue,
                upcomingBookings,
                completedBookings,
                bookings
            }
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to fetch hotel bookings" });
    }
}