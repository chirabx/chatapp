import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.routes.js";
import botRoutes from "./routes/bot.js";
import gamesRoutes from "./routes/games.js";
import { initSocket } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const __dirname = path.resolve();
const app = express();
const server = createServer(app);

// 初始化socket.io
const io = initSocket(server);
app.set("io", io);

// 配置请求体大小限制
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 中间件
app.use(
    cors({
        origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : "/",
        credentials: true,
    })
);
app.use(cookieParser());

// 路由
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/friends", friendRoutes);
app.use("/bot", botRoutes);
app.use("/api/games", gamesRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}


// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            error: '请求数据太大，请减小图片大小'
        });
    }
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

// 连接数据库
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
    });