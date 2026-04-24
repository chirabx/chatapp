import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSendingMessage: false,
    pendingMessages: [], // 正在发送的消息
    lastSendTime: 0, // 上次发送消息的时间戳
    minSendInterval: 3000, // 最小发送间隔（毫秒），3秒

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            // 确保返回的数据是数组
            const usersData = Array.isArray(res.data) ? res.data : [];
            set({ users: usersData });
        } catch (error) {
            set({ users: [] });
            toast.error(error.response?.data?.message || "获取用户列表失败");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            // 确保返回的数据是数组
            const messagesData = Array.isArray(res.data) ? res.data : [];
            set({ messages: messagesData });
        } catch (error) {
            set({ messages: [] });
            toast.error(error.response?.data?.message || "获取消息失败");
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages, isSendingMessage, lastSendTime, minSendInterval } = get();

        // 防止重复发送
        if (isSendingMessage) {
            toast.error("消息正在发送中，请稍候...");
            return;
        }

        if (!selectedUser) {
            toast.error("请先选择一个聊天对象");
            return;
        }

        // 防刷
        const now = Date.now();
        const timeSinceLastSend = now - lastSendTime;
        if (timeSinceLastSend < minSendInterval) {
            const remainingTime = Math.ceil((minSendInterval - timeSinceLastSend) / 1000);
            toast.error(`发送过快，请等待 ${remainingTime} 秒后再试`);
            return;
        }

        // 创建临时消息（带转圈状态）
        const tempMessage = {
            _id: `temp_${Date.now()}_${Math.random()}`,
            senderId: useAuthStore.getState().authUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isPending: true, // 标记为待发送状态
            tempId: `temp_${Date.now()}_${Math.random()}`
        };

        set({
            isSendingMessage: true,
            messages: [...(Array.isArray(messages) ? messages : []), tempMessage],
            pendingMessages: [...(Array.isArray(get().pendingMessages) ? get().pendingMessages : []), tempMessage.tempId],
            lastSendTime: now // 更新最后发送时间
        });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

            // 移除临时消息，添加真实消息
            set((state) => ({
                messages: (Array.isArray(state.messages) ? state.messages : [])
                    .filter(msg => msg.tempId !== tempMessage.tempId)
                    .concat([res.data]),
                pendingMessages: Array.isArray(state.pendingMessages) ? state.pendingMessages.filter(id => id !== tempMessage.tempId) : [],
                isSendingMessage: false
            }));
        } catch (error) {
            // 发送失败，移除临时消息并显示错误
            set((state) => ({
                messages: Array.isArray(state.messages) ? state.messages.filter(msg => msg.tempId !== tempMessage.tempId) : [],
                pendingMessages: Array.isArray(state.pendingMessages) ? state.pendingMessages.filter(id => id !== tempMessage.tempId) : [],
                isSendingMessage: false
            }));
            toast.error(error.response?.data?.message || "发送消息失败");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            const isMessageSentByMe = newMessage.senderId === useAuthStore.getState().authUser._id;

            // 只添加对方发送的消息，不添加自己发送的消息（避免重复）
            if (isMessageSentFromSelectedUser && !isMessageSentByMe) {
                set((state) => ({
                    messages: [...(Array.isArray(state.messages) ? state.messages : []), newMessage],
                }));
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

    clearChatState: () => {
        set({
            messages: [],
            selectedUser: null,
        });
        get().unsubscribeFromMessages();
    },

    // 清空聊天记录
    clearChatHistory: async (userId) => {
        try {
            await axiosInstance.delete(`/messages/clear/${userId}`);
            set({ messages: [] });
            toast.success("聊天记录已清空");
        } catch (error) {
            toast.error(error.response?.data?.message || "清空聊天记录失败");
            throw error;
        }
    },

    // 处理聊天记录被清空的通知
    handleChatHistoryCleared: (data) => {
        set({ messages: [] });
        toast.info(data.message || "聊天记录已清空");
    },
}));
