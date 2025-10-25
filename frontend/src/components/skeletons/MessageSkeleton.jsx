const MessageSkeleton = ({ isGroupChat = false }) => {
    // Create an array of 6 items for skeleton messages
    const skeletonMessages = Array(6).fill(null);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {skeletonMessages.map((_, idx) => (
                <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
                    <div className="chat-image avatar">
                        <div className="size-10 rounded-full">
                            <div className="skeleton w-full h-full rounded-full" />
                        </div>
                    </div>

                    <div className="chat-header mb-1">
                        {/* 群聊显示发送者名称骨架 */}
                        {isGroupChat && idx % 2 === 0 && (
                            <div className="skeleton h-4 w-20 mr-2" />
                        )}
                        <div className="skeleton h-4 w-16" />
                    </div>

                    <div className="chat-bubble bg-transparent p-0">
                        <div className={`skeleton h-16 ${idx % 3 === 0 ? 'w-[150px]' : idx % 3 === 1 ? 'w-[200px]' : 'w-[180px]'}`} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageSkeleton;
