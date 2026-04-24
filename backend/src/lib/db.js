import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // 使用本地 MongoDB 数据库，使用 127.0.0.1 而不是 localhost 以避免 IPv6 问题
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat_db";
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error: ", error)
    }
}