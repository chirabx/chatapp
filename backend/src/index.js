import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { io, app, server } from "./lib/socket.js";

dotenv.config();


const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' })); // 例如设置为 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
)

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
    connectDB();
})