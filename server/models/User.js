import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Clerk user id
  username: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, default: 'https://yourapp.com/default-avatar.png' },
  role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
  recentSearchedCities: [{ type: String }] // allow empty array
}, { timestamps: true });

export default mongoose.model("User", userSchema);
