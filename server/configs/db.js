import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(
      "🔄 Connecting to MongoDB with URI:",
      process.env.MONGODB_URI?.substring(0, 50) + "..."
    );

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected Successfully to:", conn.connection.host);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    console.error("MONGODB_URI:", process.env.MONGODB_URI);
    process.exit(1);
  }
};

export default connectDB;