import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useEffect } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import GroupChat from "./GroupChat";
import MessageList from "./MessageList";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
        isSendingMessage,
        handleChatHistoryCleared,
    } = useChatStore();
    const { selectedGroup } = useGroupStore();
    const { authUser, socket } = useAuthStore();

    useEffect(() => {
        if (selectedUser && !selectedGroup) {
            getMessages(selectedUser._id);
            subscribeToMessages();
        }

        return () => unsubscribeFromMessages();
    }, [selectedUser, selectedGroup, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    // 监听聊天记录被清空的通知
    useEffect(() => {
        if (socket) {
            socket.on("chatHistoryCleared", handleChatHistoryCleared);

            return () => {
                socket.off("chatHistoryCleared", handleChatHistoryCleared);
            };
        }
    }, [socket, handleChatHistoryCleared]);


    // 如果选择了群组，显示群组聊天
    if (selectedGroup) {
        console.log("ChatContainer - 显示群组聊天:", selectedGroup);
        return <GroupChat />;
    }

    // 如果没有选择用户，显示空状态
    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-200 p-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="text-4xl sm:text-6xl mb-4">💬</div>
                    <h3 className="text-lg sm:text-xl font-medium text-base-content/70 mb-2">
                        选择一个聊天开始对话
                    </h3>
                    <p className="text-sm sm:text-base text-base-content/50">
                        从左侧选择一个好友或群组开始聊天
                    </p>
                </div>
            </div>
        );
    }

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />
            <MessageList
                messages={messages}
                isGroupChat={false}
                otherUser={selectedUser}
                isLoading={isMessagesLoading}
            />
            <MessageInput />
        </div>
    );
};

export default ChatContainer;
