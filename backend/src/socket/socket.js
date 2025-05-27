import { Server } from "socket.io";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    // 存储在线用户
    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // 用户加入
        socket.on("join", ({ userId }) => {
            if (userId) {
                onlineUsers.set(userId, socket.id);
                socket.userId = userId;
                socket.join(userId);
                console.log(`User ${userId} joined`);

                // 广播在线用户列表
                io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            }
        });

        // 用户断开连接
        socket.on("disconnect", () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                console.log(`User ${socket.userId} disconnected`);
                io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            }
        });
    });

    return io;
}; 