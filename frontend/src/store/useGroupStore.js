import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useGroupStore = create((set, get) => ({
    groups: [],
    selectedGroup: null,
    groupMessages: [],
    groupMembers: [],
    isLoading: false,
    isMessagesLoading: false,
    isCreatingGroup: false, // 群组创建状态
    isSendingMessage: false, // 群组消息发送状态
    pendingGroupMessages: [], // 正在发送的群组消息
    lastFetchTime: null,
    cacheExpiry: 5 * 60 * 1000, // 5分钟缓存

    // 获取群组列表
    fetchGroups: async (forceRefresh = false) => {
        const { lastFetchTime, cacheExpiry, groups } = get();
        const now = Date.now();

        // 如果缓存未过期且不是强制刷新，直接返回
        if (!forceRefresh && lastFetchTime && (now - lastFetchTime) < cacheExpiry && groups.length > 0) {
            return groups;
        }

        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/groups");
            set({
                groups: res.data,
                lastFetchTime: now,
                isLoading: false
            });
            return res.data;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || "获取群组列表失败");
            throw error;
        }
    },

    // 创建群组
    createGroup: async (groupData) => {
        const { isCreatingGroup } = get();

        // 防止重复创建
        if (isCreatingGroup) {
            toast.error("群组正在创建中，请稍候...");
            return;
        }

        if (!groupData.name?.trim()) {
            toast.error("群组名称不能为空");
            return;
        }

        set({ isCreatingGroup: true });
        try {
            const res = await axiosInstance.post("/groups", groupData);
            const newGroup = res.data;
            set((state) => ({
                groups: [newGroup, ...state.groups],
                isCreatingGroup: false
            }));
            toast.success("群组创建成功");
            return newGroup;
        } catch (error) {
            set({ isCreatingGroup: false });
            const errorMessage = error.response?.data?.message || "创建群组失败";
            toast.error(errorMessage);
            throw error;
        }
    },

    // 选择群组
    selectGroup: (group) => {
        set({
            selectedGroup: group,
            groupMessages: [], // 立即清空消息
            groupMembers: []   // 立即清空成员
        });
    },

    // 获取群组详情
    getGroupDetails: async (groupId) => {
        try {
            const res = await axiosInstance.get(`/groups/${groupId}`);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "获取群组详情失败");
            throw error;
        }
    },

    // 更新群组信息
    updateGroup: async (groupId, updateData) => {
        try {
            const res = await axiosInstance.put(`/groups/${groupId}`, updateData);
            const updatedGroup = res.data;
            set((state) => ({
                groups: state.groups.map(group =>
                    group._id === groupId ? updatedGroup : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup
            }));
            toast.success("群组信息已更新");
            return updatedGroup;
        } catch (error) {
            toast.error(error.response?.data?.message || "更新群组失败");
            throw error;
        }
    },

    // 添加群成员（通过邮箱）
    addMember: async (groupId, email) => {
        try {
            const res = await axiosInstance.post(`/groups/${groupId}/members`, { email });
            const updatedGroup = res.data;
            set((state) => ({
                groups: state.groups.map(group =>
                    group._id === groupId ? updatedGroup : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup
            }));
            toast.success("成员添加成功");
            return updatedGroup;
        } catch (error) {
            toast.error(error.response?.data?.message || "添加成员失败");
            throw error;
        }
    },

    // 添加群成员（通过用户ID）
    addMemberById: async (groupId, userId) => {
        try {
            const res = await axiosInstance.post(`/groups/${groupId}/members`, { userId });
            const updatedGroup = res.data;
            set((state) => ({
                groups: state.groups.map(group =>
                    group._id === groupId ? updatedGroup : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup
            }));
            toast.success("成员添加成功");
            return updatedGroup;
        } catch (error) {
            toast.error(error.response?.data?.message || "添加成员失败");
            throw error;
        }
    },

    // 移除群成员
    removeMember: async (groupId, memberId) => {
        try {
            const res = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
            const updatedGroup = res.data;
            set((state) => ({
                groups: state.groups.map(group =>
                    group._id === groupId ? updatedGroup : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup
            }));
            toast.success("成员已移除");
            return updatedGroup;
        } catch (error) {
            toast.error(error.response?.data?.message || "移除成员失败");
            throw error;
        }
    },

    // 退出群组
    leaveGroup: async (groupId) => {
        try {
            await axiosInstance.post(`/groups/${groupId}/leave`);
            set((state) => ({
                groups: state.groups.filter(group => group._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup
            }));
            toast.success("已退出群组");
        } catch (error) {
            toast.error(error.response?.data?.message || "退出群组失败");
            throw error;
        }
    },

    // 删除群组
    deleteGroup: async (groupId) => {
        try {
            await axiosInstance.delete(`/groups/${groupId}`);
            set((state) => ({
                groups: state.groups.filter(group => group._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup
            }));
            toast.success("群组已删除");
        } catch (error) {
            toast.error(error.response?.data?.message || "删除群组失败");
            throw error;
        }
    },

    // 获取群组消息
    getGroupMessages: async (groupId, page = 1, limit = 50) => {
        const { isMessagesLoading, groupMessages, selectedGroup } = get();

        // 防止重复请求
        if (isMessagesLoading) {
            return groupMessages;
        }

        // 如果已经有消息且是同一个群组，直接返回
        if (selectedGroup && selectedGroup._id === groupId && groupMessages.length > 0) {
            return groupMessages;
        }

        // 如果是不同的群组，先清空消息
        if (selectedGroup && selectedGroup._id !== groupId) {
            set({ groupMessages: [] });
        }

        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/group-messages/${groupId}/messages?page=${page}&limit=${limit}`);
            set({ groupMessages: res.data });
            return res.data;
        } catch (error) {
            console.error("获取群组消息失败:", error);
            toast.error(error.response?.data?.message || "获取群组消息失败");
            return [];
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // 发送群组消息
    sendGroupMessage: async (groupId, messageData, authUser) => {
        const { isSendingMessage, groupMessages } = get();

        // 防止重复发送
        if (isSendingMessage) {
            toast.error("消息正在发送中，请稍候...");
            return;
        }

        if (!groupId) {
            toast.error("请先选择一个群组");
            return;
        }

        // 创建临时消息（带转圈状态）
        const tempMessage = {
            _id: `temp_${Date.now()}_${Math.random()}`,
            groupId: groupId,
            senderId: {
                _id: authUser?._id || "temp_user",
                fullName: authUser?.fullName || "发送中...",
                profilePic: authUser?.profilePic || "/avatar.png"
            },
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isPending: true, // 标记为待发送状态
            tempId: `temp_${Date.now()}_${Math.random()}`
        };

        set({
            isSendingMessage: true,
            groupMessages: [...groupMessages, tempMessage],
            pendingGroupMessages: [...get().pendingGroupMessages, tempMessage.tempId]
        });

        try {
            const res = await axiosInstance.post(`/group-messages/${groupId}/send`, messageData);
            const newMessage = res.data;

            // 移除临时消息，添加真实消息
            set((state) => ({
                groupMessages: state.groupMessages
                    .filter(msg => msg.tempId !== tempMessage.tempId)
                    .concat([newMessage]),
                pendingGroupMessages: state.pendingGroupMessages.filter(id => id !== tempMessage.tempId),
                isSendingMessage: false
            }));
            return newMessage;
        } catch (error) {
            // 发送失败，移除临时消息并显示错误
            set((state) => ({
                groupMessages: state.groupMessages.filter(msg => msg.tempId !== tempMessage.tempId),
                pendingGroupMessages: state.pendingGroupMessages.filter(id => id !== tempMessage.tempId),
                isSendingMessage: false
            }));
            toast.error(error.response?.data?.message || "发送消息失败");
            throw error;
        }
    },

    // 获取群组成员
    getGroupMembers: async (groupId) => {
        const { groupMembers, selectedGroup } = get();

        // 如果已经有成员且是同一个群组，直接返回
        if (selectedGroup && selectedGroup._id === groupId && groupMembers.length > 0) {
            return groupMembers;
        }

        // 如果是不同的群组，先清空成员
        if (selectedGroup && selectedGroup._id !== groupId) {
            set({ groupMembers: [] });
        }

        try {
            const res = await axiosInstance.get(`/group-messages/${groupId}/members`);
            set({ groupMembers: res.data });
            return res.data;
        } catch (error) {
            console.error("获取群组成员失败:", error);
            toast.error(error.response?.data?.message || "获取群组成员失败");
            return [];
        }
    },

    // 处理新群组消息
    handleNewGroupMessage: (message) => {
        set((state) => {
            // 检查是否是当前选中的群组
            if (!state.selectedGroup || state.selectedGroup._id !== message.groupId) {
                return state;
            }

            // 检查是否已经存在该消息（通过_id或tempId检查）
            const isDuplicate = state.groupMessages.some(msg =>
                msg._id === message._id ||
                (msg.tempId && msg.tempId === message.tempId)
            );

            if (isDuplicate) {
                return state;
            }

            // 检查是否是当前用户发送的消息，如果是则不通过Socket添加
            // 注意：这里需要从外部传入authUser，避免循环导入
            // const { authUser } = useAuthStore.getState();
            // if (message.senderId._id === authUser._id) {
            //     return state;
            // }

            return {
                groupMessages: [...state.groupMessages, message]
            };
        });
    },

    // 处理群组更新
    handleGroupUpdated: (group) => {
        set((state) => ({
            groups: state.groups.map(g => g._id === group._id ? group : g),
            selectedGroup: state.selectedGroup?._id === group._id ? group : state.selectedGroup
        }));
    },

    // 处理群成员添加
    handleGroupMemberAdded: (data) => {
        set((state) => ({
            groups: state.groups.map(g => g._id === data.group._id ? data.group : g),
            selectedGroup: state.selectedGroup?._id === data.group._id ? data.group : state.selectedGroup
        }));
        toast.success(`${data.newMember.fullName} 加入了群组`);
    },

    // 处理群成员移除
    handleGroupMemberRemoved: (data) => {
        set((state) => ({
            groups: state.groups.map(g => g._id === data.group._id ? data.group : g),
            selectedGroup: state.selectedGroup?._id === data.group._id ? data.group : state.selectedGroup
        }));
    },

    // 处理群成员离开
    handleGroupMemberLeft: (data) => {
        set((state) => ({
            groups: state.groups.map(g => g._id === data.group._id ? data.group : g),
            selectedGroup: state.selectedGroup?._id === data.group._id ? data.group : state.selectedGroup
        }));
    },

    // 处理群组删除
    handleGroupDeleted: (data) => {
        set((state) => ({
            groups: state.groups.filter(g => g._id !== data.groupId),
            selectedGroup: state.selectedGroup?._id === data.groupId ? null : state.selectedGroup
        }));
        toast.success(`群组 "${data.groupName}" 已被删除`);
    },

    // 处理被移除出群组
    handleRemovedFromGroup: (data) => {
        set((state) => ({
            groups: state.groups.filter(g => g._id !== data.groupId),
            selectedGroup: state.selectedGroup?._id === data.groupId ? null : state.selectedGroup
        }));
        toast.error(`您已被移除出群组 "${data.groupName}"`);
    },

    handleGroupMessageDeleted: (data) => {
        set((state) => ({
            groupMessages: state.groupMessages.filter(msg => msg._id !== data.messageId)
        }));
    },

    handleGroupChatHistoryCleared: (data) => {
        set({ groupMessages: [] });
        toast.info(data.message || "群组聊天记录已清空");
    },

    // 清空群组状态
    clearGroupState: () => {
        set({
            selectedGroup: null,
            groupMessages: [],
            groupMembers: []
        });
    },

    // 清空群组聊天状态
    clearGroupChatState: () => {
        set({
            groupMessages: [],
            groupMembers: [],
            isMessagesLoading: false,
            isSendingMessage: false,
            pendingGroupMessages: []
        });
    },

    // 清空群组聊天记录
    clearGroupChatHistory: async (groupId) => {
        try {
            await axiosInstance.delete(`/group-messages/${groupId}/clear`);
            set({ groupMessages: [] });
            toast.success("群组聊天记录已清空");
        } catch (error) {
            toast.error(error.response?.data?.message || "清空群组聊天记录失败");
            throw error;
        }
    }
}));
