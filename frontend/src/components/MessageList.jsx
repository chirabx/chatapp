import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { MessageSquare } from 'lucide-react';

const MessageList = ({
    messages = [],
    isGroupChat = false,
    otherUser = null,
    isLoading = false,
    className = ""
}) => {
    const messagesEndRef = useRef(null);

    // 自动滚动到底部
    useEffect(() => {
        if (messagesEndRef.current && messages) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isLoading) {
        return <MessageSkeleton isGroupChat={isGroupChat} />;
    }

    if (!messages || messages.length === 0) {
        return (
            <div className={`flex-1 flex items-center justify-center p-4 ${className || ''}`}>
                <div className="max-w-md text-center space-y-6">
                    {/* Icon Display */}
                    <div className="flex justify-center gap-4 mb-4">
                        <div className="relative">
                            <div
                                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
                                justify-center animate-bounce"
                            >
                                <MessageSquare className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <h2 className="text-2xl font-bold text-base-content text-center">
                        {isGroupChat ? "群组聊天" : "私聊"}
                    </h2>
                    <p className="text-base-content/60 text-center">
                        {isGroupChat ? "群组还没有消息，开始聊天吧！" : "还没有消息，开始聊天吧！"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 ${className || ''}`}>
            {messages.map((message) => (
                <ChatMessage
                    key={message._id || message.tempId}
                    message={message}
                    isGroupChat={isGroupChat}
                    otherUser={otherUser}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
