import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"));
        mongoose.connection.on('error', (err) => console.error("MongoDB connection error:", err));
        await mongoose.connect(
            process.env.MONGODB_URI, // ✅ Use full URI from .env
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 20000, // Increase timeout to 20s
                socketTimeoutMS: 20000, // Increase socket timeout
            }
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1); // Exit if DB connection fails
    }
}

export default connectDB;