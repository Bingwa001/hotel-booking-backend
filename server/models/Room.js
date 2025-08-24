import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
      hotel: {type: String, ref: "Hotel", reqiured: true},
      roomType: {type: String, reqiured: true},
      pricePerNight: {type: Number, reqiured: true},
      amenities: {type: Array, reqiured: true},
      images: [{type: String }],
      isAvailable: {type: Boolean, default: true},

      
},{ timestamps: true });
    

const Room = mongoose.model('Room', roomSchema);

export default Room;