import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...", process.env.MONGODB_URI);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected:", conn.connection.host);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;