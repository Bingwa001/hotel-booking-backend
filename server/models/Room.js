import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
      hotel: {type: String, ref: "Hotel", required: true}, // Fixed: "required" not "reqiured"
      roomType: {type: String, required: true}, // Fixed: "required" not "reqiured"  
      pricePerNight: {type: Number, required: true}, // Fixed: "required" not "reqiured"
      amenities: {type: Array, required: true}, // Fixed: "required" not "reqiured"
      images: [{type: String }],
      isAvailable: {type: Boolean, default: true},
},{ timestamps: true });

const Room = mongoose.model('Room', roomSchema);

export default Room;