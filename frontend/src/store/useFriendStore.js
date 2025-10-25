import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";

export const useFriendStore = create((set, get) => ({
    friends: [],
    friendRequests: [],
    isLoading: false,
    unreadRequests: 0,
    lastFetchTime: null,
    cacheExpiry: 5 * 60 * 1000, // 5分钟缓存

    fetchFriends: async (forceRefresh = false) => {
        const { lastFetchTime, cacheExpiry, friends } = get();
        const now = Date.now();

        // 如果缓存未过期且不是强制刷新，直接返回
        if (!forceRefresh && lastFetchTime && (now - lastFetchTime) < cacheExpiry && friends.length > 0) {
            return friends;
        }

        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friends");
            set({
                friends: res.data,
                lastFetchTime: now,
                isLoading: false
            });
            return res.data;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || "获取好友列表失败");
            throw error;
        }
    },

    fetchFriendRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/requests");
            const unreadCount = res.data.filter(req => !req.read).length;
            set({
                friendRequests: res.data,
                unreadRequests: unreadCount
            });
            return unreadCount;
        } catch (error) {
            toast.error(error.response?.data?.message || "获取好友请求失败");
            return 0;
        }
    },

    sendFriendRequest: async (email) => {
        set({ isLoading: true });
        try {
            await axiosInstance.post("/friends/send-request", { email });
            toast.success("好友请求已发送");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "发送好友请求失败";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    respondToFriendRequest: async (requestId, status) => {
        if (!requestId) {
            toast.error("无效的请求ID");
            return;
        }
        try {
            const response = await axiosInstance.put(`/friends/requests/${requestId}`, { status });
            set((state) => ({
                friendRequests: state.friendRequests.filter((req) => req._id !== requestId),
            }));
            if (status === "accepted") {
                await get().fetchFriends();
            }
            toast.success(status === "accepted" ? "已接受好友请求" : "已拒绝好友请求");
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "处理好友请求失败";
            toast.error(errorMessage);
            throw error;
        }
    },

    removeFriend: async (friendId) => {
        try {
            await axiosInstance.delete(`/friends/${friendId}`);
            set((state) => ({
                friends: state.friends.filter((friend) => friend._id !== friendId),
            }));

            const selectedUser = useChatStore.getState().selectedUser;
            if (selectedUser && selectedUser._id === friendId) {
                useChatStore.getState().clearChatState();
            }

            toast.success("已成功删除好友");
        } catch (error) {
            toast.error(error.response?.data?.message || "删除好友失败");
        }
    },

    handleNewFriendRequest: (request) => {
        set((state) => {
            const isDuplicate = state.friendRequests.some(req => req._id === request.requestId);
            if (isDuplicate) {
                return state;
            }

            return {
                friendRequests: [...state.friendRequests, {
                    _id: request.requestId,
                    sender: {
                        _id: request.sender._id,
                        fullName: request.sender.fullName,
                        email: request.sender.email,
                        profilePic: request.sender.profilePic
                    },
                    status: "sending",
                    read: false,
                    createdAt: new Date()
                }],
                unreadRequests: state.unreadRequests + 1
            };
        });
        toast.success("收到新的好友请求！");
    },

    handleFriendRequestResponse: (requestId, status) => {
        set((state) => ({
            friendRequests: state.friendRequests.filter((req) => req._id !== requestId),
        }));
        if (status === "accepted") {
            get().fetchFriends();
        }
        toast.success(status === "accepted" ? "好友请求已接受" : "好友请求已拒绝");
    },

    handleFriendRemoved: (userId) => {
        set((state) => ({
            friends: state.friends.filter((friend) => friend._id !== userId),
        }));

        const selectedUser = useChatStore.getState().selectedUser;
        if (selectedUser && selectedUser._id === userId) {
            useChatStore.getState().clearChatState();
        }

        toast.success("对方已将你从好友列表中删除");
    },

    markRequestsAsRead: async () => {
        try {
            await axiosInstance.put("/friends/requests/mark-read");
            set({ unreadRequests: 0 });
        } catch (error) {
            toast.error(error.response?.data?.message || "标记请求为已读失败");
        }
    },
})); 