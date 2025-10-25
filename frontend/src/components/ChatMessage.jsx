import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';
import ImagePreview from './ImagePreview';
import LazyImage from './LazyImage';

const ChatMessage = ({
    message,
    isGroupChat = false,
    otherUser = null, // 私聊时的对方用户信息
    className = ""
}) => {
    const { authUser } = useAuthStore();

    // 判断消息是否由当前用户发送
    const isOwnMessage = isGroupChat
        ? message.senderId._id === authUser._id
        : message.senderId === authUser._id;

    // 获取发送者信息
    const getSenderInfo = () => {
        if (isGroupChat) {
            return {
                name: message.senderId.fullName,
                avatar: message.senderId.profilePic || "/avatar.png"
            };
        } else {
            return {
                name: isOwnMessage ? authUser.fullName : (otherUser?.fullName || "未知用户"),
                avatar: isOwnMessage
                    ? (authUser.profilePic || "/avatar.png")
                    : (otherUser?.profilePic || "/avatar.png")
            };
        }
    };

    const senderInfo = getSenderInfo();

    return (
        <div className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} ${className}`}>
            {/* 头像 */}
            <div className="chat-image avatar">
                <div className="size-8 sm:size-10 rounded-full border">
                    <LazyImage
                        src={senderInfo.avatar}
                        alt={senderInfo.name}
                        className="size-8 sm:size-10 rounded-full"
                    />
                </div>
            </div>

            {/* 消息头部（群聊显示发送者姓名） */}
            <div className="chat-header mb-1">
                {isGroupChat && !isOwnMessage && (
                    <span className="font-medium text-xs sm:text-sm">{senderInfo.name}</span>
                )}
                <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                </time>
            </div>

            {/* 消息内容 */}
            <div className="chat-bubble flex flex-col max-w-xs sm:max-w-md">
                {/* 图片消息 */}
                {message.image && (
                    <ImagePreview
                        src={message.image}
                        alt="消息图片"
                        className="max-w-[150px] sm:max-w-[200px] rounded-md mb-2"
                    />
                )}

                {/* 文本消息 */}
                {message.text && <p className="text-sm sm:text-base">{message.text}</p>}

                {/* 发送中状态 */}
                {message.isPending && (
                    <div className="flex items-center gap-1 mt-1">
                        <div className="loading loading-spinner loading-xs"></div>
                        <span className="text-xs opacity-70">发送中...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
