import mongoose from 'mongoose';    

const connectDB = async () => {
    try {
        // Set up event listeners before connecting
        mongoose.connection.on('connected', () => {
            console.log("Database Connected successfully");
            console.log("Connected to:", mongoose.connection.name);
        });
        
        mongoose.connection.on('error', (err) => {
            console.log("Database connection error:", err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log("Database disconnected");
        });
        
        // Connect and wait for the connection to be established
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        // Additional confirmation
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Connection State: ${mongoose.connection.readyState}`); // Should be 1
        
        return conn;
    } catch (error) {
        console.log("Connection failed:", error.message);
        process.exit(1);
    }
}
  
export default connectDB;