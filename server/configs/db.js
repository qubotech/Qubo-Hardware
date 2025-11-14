import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        mongoose.connection.on('connected', ()=> console.log("Database Connected")
        );
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`)
        console.log("MongoDB connection successful");
    } catch (error) {
        console.error("Database connection error:", error.message);
        // Optionally, exit the process or handle gracefully
        // process.exit(1); // Uncomment if you want to crash on DB failure
    }
}


export default connectDB;