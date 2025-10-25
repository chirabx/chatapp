import { useEffect, useState, useRef } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Settings, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import LazyImage from "./LazyImage";
import MessageList from "./MessageList";
import GroupMessageInput from "./GroupMessageInput";
import ClearChatModal from "./ClearChatModal";

const GroupChat = () => {
    const { selectedGroup, groupMessages, groupMembers, isMessagesLoading, isSendingMessage,
        getGroupMessages, sendGroupMessage, getGroupMembers, clearGroupChatHistory, clearGroupChatState } = useGroupStore();
    const { authUser, socket } = useAuthStore();
    const [showMembers, setShowMembers] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const loadingTimeoutRef = useRef(null);
    const lastGroupIdRef = useRef(null);

    useEffect(() => {
        if (selectedGroup) {
            // 清理之前的超时
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }

            // 检查是否是新的群组
            const isNewGroup = lastGroupIdRef.current !== selectedGroup._id;
            lastGroupIdRef.current = selectedGroup._id;

            // 如果是新群组，立即清空状态并加载数据
            if (isNewGroup) {
                // 立即清空消息和成员状态
                clearGroupChatState();

                // 加载新群组的数据
                getGroupMessages(selectedGroup._id);
                getGroupMembers(selectedGroup._id);
            }

            // 加入群组房间
            if (socket) {
                socket.emit("joinGroup", selectedGroup._id);
            }
        }

        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
            if (selectedGroup && socket) {
                socket.emit("leaveGroup", selectedGroup._id);
            }
        };
    }, [selectedGroup?._id, socket]);

    // Socket事件监听 - 只在组件挂载时注册一次
    useEffect(() => {
        if (!socket) return;

        const handleNewGroupMessage = (message) => {
            useGroupStore.getState().handleNewGroupMessage(message);
        };

        const handleGroupUpdated = (group) => {
            useGroupStore.getState().handleGroupUpdated(group);
        };

        const handleGroupMemberAdded = (data) => {
            useGroupStore.getState().handleGroupMemberAdded(data);
        };

        const handleGroupMemberRemoved = (data) => {
            useGroupStore.getState().handleGroupMemberRemoved(data);
        };

        const handleGroupMemberLeft = (data) => {
            useGroupStore.getState().handleGroupMemberLeft(data);
        };

        const handleGroupDeleted = (data) => {
            useGroupStore.getState().handleGroupDeleted(data);
        };

        const handleRemovedFromGroup = (data) => {
            useGroupStore.getState().handleRemovedFromGroup(data);
        };

        const handleGroupMessageDeleted = (data) => {
            useGroupStore.getState().handleGroupMessageDeleted(data);
        };

        const handleGroupChatHistoryCleared = (data) => {
            useGroupStore.getState().handleGroupChatHistoryCleared(data);
        };

        // 注册事件监听器
        socket.on("newGroupMessage", handleNewGroupMessage);
        socket.on("groupUpdated", handleGroupUpdated);
        socket.on("groupMemberAdded", handleGroupMemberAdded);
        socket.on("groupMemberRemoved", handleGroupMemberRemoved);
        socket.on("groupMemberLeft", handleGroupMemberLeft);
        socket.on("groupDeleted", handleGroupDeleted);
        socket.on("removedFromGroup", handleRemovedFromGroup);
        socket.on("groupMessageDeleted", handleGroupMessageDeleted);
        socket.on("groupChatHistoryCleared", handleGroupChatHistoryCleared);

        return () => {
            // 清理事件监听器
            socket.off("newGroupMessage", handleNewGroupMessage);
            socket.off("groupUpdated", handleGroupUpdated);
            socket.off("groupMemberAdded", handleGroupMemberAdded);
            socket.off("groupMemberRemoved", handleGroupMemberRemoved);
            socket.off("groupMemberLeft", handleGroupMemberLeft);
            socket.off("groupDeleted", handleGroupDeleted);
            socket.off("removedFromGroup", handleRemovedFromGroup);
            socket.off("groupMessageDeleted", handleGroupMessageDeleted);
            socket.off("groupChatHistoryCleared", handleGroupChatHistoryCleared);
        };
    }, [socket]);

    // 清理群组状态 - 当组件卸载时
    useEffect(() => {
        return () => {
            if (socket && selectedGroup) {
                socket.emit("leaveGroup", selectedGroup._id);
            }
        };
    }, []);

    // 处理清空群聊记录
    const handleClearGroupChat = async () => {
        if (!selectedGroup) return;

        setIsClearing(true);
        try {
            await clearGroupChatHistory(selectedGroup._id);
            setShowClearModal(false);
        } catch (error) {
            console.error("清空群组聊天记录失败:", error);
        } finally {
            setIsClearing(false);
        }
    };

    // 检查用户是否有权限清空群聊记录
    const canClearChat = selectedGroup && (
        selectedGroup.createdBy._id === authUser._id ||
        selectedGroup.members.some(member =>
            member.user._id === authUser._id && member.role === "admin"
        )
    );

    if (!selectedGroup) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-200 p-4">
                <div className="text-center max-w-md mx-auto">
                    <Users className="size-12 sm:size-16 mx-auto text-base-content/30 mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-base-content/70 mb-2">
                        选择一个群组开始聊天
                    </h3>
                    <p className="text-sm sm:text-base text-base-content/50">
                        从左侧选择一个群组或创建新群组
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-base-100 h-full">
            {/* 群组头部 */}
            <div className="border-b border-base-300 p-2 sm:p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <LazyImage
                            src={selectedGroup.avatar || "/avatar.png"}
                            alt={selectedGroup.name}
                            className="size-8 sm:size-10 object-cover rounded-full flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm sm:text-base truncate">
                                {selectedGroup.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-base-content/70 truncate">
                                {selectedGroup.members.length} 成员
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                            onClick={() => setShowMembers(!showMembers)}
                            className="btn btn-sm btn-ghost p-1 sm:p-2"
                            title="群成员"
                        >
                            <Users className="size-4 sm:size-5" />
                            <span className="hidden sm:inline ml-1">成员</span>
                        </button>
                        {canClearChat && (
                            <button
                                onClick={() => setShowClearModal(true)}
                                className="btn btn-sm btn-ghost p-1 sm:p-2"
                                title="清空聊天记录"
                            >
                                <Trash2 className="size-4 sm:size-5" />
                                <span className="hidden sm:inline ml-1">清空</span>
                            </button>
                        )}
                        <Link
                            to={`/groups/${selectedGroup._id}/settings`}
                            state={{ fromGroup: true }}
                            className="btn btn-sm btn-ghost p-1 sm:p-2"
                            title="群组设置"
                        >
                            <Settings className="size-4 sm:size-5" />
                            <span className="hidden sm:inline ml-1">设置</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 消息区域和群成员侧边栏容器 */}
            <div className="flex-1 flex relative min-h-0">
                {/* 消息区域 */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* 消息列表 - 固定高度，可滚动 */}
                    <MessageList
                        messages={groupMessages}
                        isGroupChat={true}
                        otherUser={null}
                        isLoading={isMessagesLoading}
                        className="flex-1 overflow-y-auto min-h-0"
                    />
                </div>

                {/* 群成员侧边栏 - 绝对定位，不影响布局 */}
                <div className={`absolute right-0 top-0 bottom-0 w-64 sm:w-72 bg-base-100 border-l border-base-300 p-2 sm:p-4 transition-all duration-300 ease-in-out transform z-10 ${showMembers
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0 pointer-events-none'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm sm:text-base">群成员 ({groupMembers.length})</h4>
                        <button
                            onClick={() => setShowMembers(false)}
                            className="btn btn-sm btn-ghost p-1 sm:hidden"
                            title="关闭"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    <div className="space-y-2 overflow-y-auto h-full pb-16">
                        {groupMembers.map((member) => (
                            <div
                                key={member.user._id}
                                className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors duration-200"
                            >
                                <LazyImage
                                    src={member.user.profilePic || "/avatar.png"}
                                    alt={member.user.fullName}
                                    className="size-6 sm:size-8 object-cover rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-xs sm:text-sm truncate">
                                        {member.user.fullName}
                                    </div>
                                    <div className="text-xs text-base-content/70">
                                        {member.role === "admin" ? "管理员" : "成员"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 消息输入 - 固定在底部 */}
            <div className="flex-shrink-0">
                <GroupMessageInput groupId={selectedGroup._id} />
            </div>

            {/* 清空群聊记录模态框 */}
            <ClearChatModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleClearGroupChat}
                chatType="群组"
                isLoading={isClearing}
            />
        </div>
    );
};

export default GroupChat;
