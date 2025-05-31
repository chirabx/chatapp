import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useFriendStore } from "./useFriendStore.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("登录成功");

            await Promise.all([
                get().connectSocket(),
                useFriendStore.getState().fetchFriendRequests()
            ]);

            return true;
        } catch (error) {
            toast.error(error.response.data.message);
            return false;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return Promise.resolve();

        return new Promise((resolve) => {
            const socket = io(BASE_URL, {
                query: {
                    userId: authUser._id,
                },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 500,
                timeout: 5000,
                transports: ['websocket']
            });

            socket.removeAllListeners();

            socket.on("connect", () => {
                console.log("Socket connected");
                socket.emit("join", { userId: authUser._id });
                set({ socket: socket });
                resolve();
            });

            socket.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
                toast.error("连接服务器失败，正在重试...");
                resolve();
            });

            socket.on("getOnlineUsers", (userIds) => {
                set({ onlineUsers: userIds });
            });

            socket.on("friendRemoved", (data) => {
                useFriendStore.getState().handleFriendRemoved(data.userId);
            });

            socket.on("newFriendRequest", (request) => {
                console.log("收到新的好友请求:", request);
                useFriendStore.getState().handleNewFriendRequest(request);
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected");
            });

            socket.on("reconnect_attempt", (attemptNumber) => {
                console.log(`尝试重连 (${attemptNumber}/3)`);
            });

            socket.on("reconnect_failed", () => {
                console.error("重连失败");
                toast.error("无法连接到服务器，请刷新页面重试");
            });
        });
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));
