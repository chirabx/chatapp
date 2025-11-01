import { X, Trash2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import ClearChatModal from "./ClearChatModal";
import FriendProfileModal from "./FriendProfileModal";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser, clearChatHistory } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const [showClearModal, setShowClearModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const handleClearChat = async () => {
        if (!selectedUser) return;

        setIsClearing(true);
        try {
            await clearChatHistory(selectedUser._id);
            setShowClearModal(false);
        } catch (error) {
            console.error("清空聊天记录失败:", error);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="p-3 sm:p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div
                        className="avatar flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowProfileModal(true)}
                        title="查看好友信息"
                    >
                        <div className="size-8 sm:size-10 rounded-full relative">
                            <img
                                src={selectedUser.profilePic || "/avatar.png"}
                                alt={selectedUser.fullName}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </div>

                    {/* User info */}
                    <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                            {selectedUser.fullName}
                        </h3>
                        <p className="text-xs sm:text-sm text-base-content/70 truncate">
                            {onlineUsers.includes(selectedUser._id) ? "在线" : "离线"}
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                        onClick={() => setShowClearModal(true)}
                        className="btn btn-ghost btn-sm"
                        title="清空聊天记录"
                    >
                        <Trash2 className="size-4 sm:size-5" />
                    </button>
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="btn btn-ghost btn-sm"
                        title="关闭聊天"
                    >
                        <X className="size-4 sm:size-5" />
                    </button>
                </div>
            </div>

            {/* Clear chat modal */}
            <ClearChatModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleClearChat}
                chatType="私聊"
                isLoading={isClearing}
            />

            {/* Friend Profile Modal */}
            <FriendProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                friend={selectedUser}
                isOnline={onlineUsers.includes(selectedUser?._id)}
            />
        </div>
    );
};
export default ChatHeader;
