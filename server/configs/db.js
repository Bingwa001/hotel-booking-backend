import mongoose from 'mongoose';    

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Database Connected successfully");
            console.log("Connected to:", mongoose.connection.name);
        });
        
        mongoose.connection.on('error', (err) => {
            console.log("Database connection error:", err);
        });
        
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log("Connection failed:", error.message);
    }
}
  
export default connectDB;