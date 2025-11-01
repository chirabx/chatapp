import { X, Mail, User, Calendar } from "lucide-react";

const FriendProfileModal = ({ isOpen, onClose, friend, isOnline }) => {
    if (!isOpen || !friend) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-base-100 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 头部 */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h2 className="text-xl font-semibold">好友信息</h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                        title="关闭"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* 内容 */}
                <div className="p-6 space-y-6">
                    {/* 头像和基本信息 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img
                                src={friend.profilePic || "/avatar.png"}
                                alt={friend.fullName}
                                className="size-24 rounded-full object-cover border-4 border-base-300"
                            />
                            {isOnline && (
                                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-base-100"></div>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold">{friend.fullName}</h3>
                            <p className="text-sm text-base-content/70 mt-1">
                                {isOnline ? (
                                    <span className="text-green-500">● 在线</span>
                                ) : (
                                    <span className="text-base-content/50">○ 离线</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* 详细信息 */}
                    <div className="space-y-4">
                        {/* 邮箱 */}
                        <div className="space-y-1.5">
                            <div className="text-sm text-base-content/70 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                邮箱地址
                            </div>
                            <p className="px-4 py-2 bg-base-200 rounded-lg">{friend.email || "未设置"}</p>
                        </div>

                        {/* 个人标签 */}
                        {friend.tagline && (
                            <div className="space-y-1.5">
                                <div className="text-sm text-base-content/70 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    个人标签
                                </div>
                                <p className="px-4 py-2 bg-base-200 rounded-lg whitespace-pre-wrap">{friend.tagline}</p>
                            </div>
                        )}

                        {/* 注册时间 */}
                        {friend.createdAt && (
                            <div className="space-y-1.5">
                                <div className="text-sm text-base-content/70 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    注册时间
                                </div>
                                <p className="px-4 py-2 bg-base-200 rounded-lg">
                                    {(() => {
                                        if (!friend.createdAt) return "未知";
                                        const date = typeof friend.createdAt === 'string'
                                            ? friend.createdAt
                                            : friend.createdAt.toISOString?.() || String(friend.createdAt);
                                        return date.split("T")[0];
                                    })()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendProfileModal;

