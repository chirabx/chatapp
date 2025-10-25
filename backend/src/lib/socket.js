import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : "/",
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling'],
        allowEIO3: true
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // 用户加入自己的房间
        const userId = socket.handshake.query.userId;
        if (userId) {
            socket.join(userId);
        }

        // 获取在线用户
        const onlineUsers = [];
        for (const [_, socket] of io.sockets.sockets) {
            const userId = socket.handshake.query.userId;
            if (userId) {
                onlineUsers.push(userId);
            }
        }
        io.emit("getOnlineUsers", onlineUsers);

        // 心跳检测
        socket.on("ping", () => {
            socket.emit("pong");
        });

        // 断开连接
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            const onlineUsers = [];
            for (const [_, socket] of io.sockets.sockets) {
                const userId = socket.handshake.query.userId;
                if (userId) {
                    onlineUsers.push(userId);
                }
            }
            io.emit("getOnlineUsers", onlineUsers);
        });

        // 群组相关事件
        socket.on("joinGroup", (groupId) => {
            socket.join(`group_${groupId}`);
            console.log(`User ${userId} joined group ${groupId}`);
        });

        socket.on("leaveGroup", (groupId) => {
            socket.leave(`group_${groupId}`);
            console.log(`User ${userId} left group ${groupId}`);
        });

        // 错误处理
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const getReceiverSocketId = (receiverId) => {
    for (const [_, socket] of io.sockets.sockets) {
        if (socket.handshake.query.userId === receiverId) {
            return socket.id;
        }
    }
    return null;
};

export { io, app, server };
