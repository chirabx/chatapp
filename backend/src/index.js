import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.routes.js";
import { initSocket } from "./lib/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);

// 初始化socket.io
const io = initSocket(server);
app.set("io", io);

// 中间件
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : "/",
        credentials: true,
    })
);

// 路由
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/friends", friendRoutes);

// 连接数据库
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        server.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
    });