import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useFriendStore } from "./useFriendStore.js";
import { useBackgroundStore } from "./useBackgroundStore.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isChangingPassword: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data });
            // 初始化背景和遮罩透明度
            useBackgroundStore.getState().initBackground(res.data?.backgroundId, res.data?.overlayOpacity, res.data?.chatBoxOpacity);
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
            // 初始化背景和遮罩透明度
            useBackgroundStore.getState().initBackground(res.data?.backgroundId, res.data?.overlayOpacity, res.data?.chatBoxOpacity);
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
            // 初始化背景和遮罩透明度
            useBackgroundStore.getState().initBackground(res.data?.backgroundId, res.data?.overlayOpacity, res.data?.chatBoxOpacity);
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
            // 如果更新了背景、遮罩透明度或聊天框透明度，同步到背景store
            if (data.backgroundId !== undefined || data.overlayOpacity !== undefined || data.chatBoxOpacity !== undefined) {
                useBackgroundStore.getState().initBackground(res.data?.backgroundId, res.data?.overlayOpacity, res.data?.chatBoxOpacity);
            }
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    changePassword: async (data) => {
        set({ isChangingPassword: true });
        try {
            await axiosInstance.put("/auth/change-password", data);
            toast.success("密码修改成功");
            return true;
        } catch (error) {
            console.log("error in change password:", error);
            toast.error(error.response?.data?.message || "密码修改失败");
            return false;
        } finally {
            set({ isChangingPassword: false });
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

            // 群组相关事件
            socket.on("groupCreated", (group) => {
                useGroupStore.getState().handleGroupUpdated(group);
            });

            socket.on("groupUpdated", (group) => {
                useGroupStore.getState().handleGroupUpdated(group);
            });

            socket.on("groupMemberAdded", (data) => {
                useGroupStore.getState().handleGroupMemberAdded(data);
            });

            socket.on("groupMemberRemoved", (data) => {
                useGroupStore.getState().handleGroupMemberRemoved(data);
            });

            socket.on("groupMemberLeft", (data) => {
                useGroupStore.getState().handleGroupMemberLeft(data);
            });

            socket.on("groupDeleted", (data) => {
                useGroupStore.getState().handleGroupDeleted(data);
            });

            socket.on("removedFromGroup", (data) => {
                useGroupStore.getState().handleRemovedFromGroup(data);
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
