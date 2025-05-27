import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Sidebar = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const { friends, fetchFriends, removeFriend } = useFriendStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [friendToRemove, setFriendToRemove] = useState(null);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    const filteredFriends = showOnlineOnly
        ? friends.filter((friend) => onlineUsers.includes(friend._id))
        : friends;

    // 计算在线好友数量
    const onlineFriendsCount = friends.filter(friend => onlineUsers.includes(friend._id)).length;

    const handleRemoveFriend = (friend) => {
        setFriendToRemove(friend);
    };

    const confirmRemoveFriend = async () => {
        if (friendToRemove) {
            await removeFriend(friendToRemove._id);
            setFriendToRemove(null);
        }
    };

    if (!friends) return <SidebarSkeleton />;

    return (
        <>
            <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
                <div className="border-b border-base-300 w-full p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="size-6" />
                            <span className="font-medium hidden lg:block">好友列表</span>
                        </div>
                        <Link
                            to="/add-friend"
                            className="btn btn-sm btn-circle"
                            title="添加好友"
                        >
                            <UserPlus className="size-5" />
                        </Link>
                    </div>
                    <div className="mt-3 hidden lg:flex items-center gap-2">
                        <label className="cursor-pointer flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showOnlineOnly}
                                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                                className="checkbox checkbox-sm"
                            />
                            <span className="text-sm">只显示在线好友</span>
                        </label>
                        <span className="text-xs text-zinc-500">
                            ({onlineFriendsCount} 在线)
                        </span>
                    </div>
                </div>

                <div className="overflow-y-auto w-full py-3">
                    {filteredFriends.map((friend) => (
                        <div
                            key={friend._id}
                            className="group relative w-full p-3 flex items-center gap-3
                            hover:bg-base-300 transition-colors"
                        >
                            <button
                                onClick={() => setSelectedUser(friend)}
                                className={`
                                    flex-1 flex items-center gap-3
                                    ${selectedUser?._id === friend._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                                `}
                            >
                                <div className="relative mx-auto lg:mx-0">
                                    <img
                                        src={friend.profilePic || "/avatar.png"}
                                        alt={friend.fullName}
                                        className="size-12 object-cover rounded-full"
                                    />
                                    {onlineUsers.includes(friend._id) && (
                                        <span
                                            className="absolute bottom-0 right-0 size-3 bg-green-500 
                                            rounded-full ring-2 ring-zinc-900"
                                        />
                                    )}
                                </div>

                                <div className="hidden lg:block text-left min-w-0">
                                    <div className="font-medium truncate">{friend.fullName}</div>
                                    <div className="text-sm text-zinc-400">
                                        {onlineUsers.includes(friend._id) ? "在线" : "离线"}
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleRemoveFriend(friend)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity
                                absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full
                                hover:bg-base-300"
                                title="删除好友"
                            >
                                <UserMinus className="size-4 text-red-500" />
                            </button>
                        </div>
                    ))}

                    {filteredFriends.length === 0 && (
                        <div className="text-center text-zinc-500 py-4">
                            {showOnlineOnly ? "没有在线好友" : "暂无好友"}
                        </div>
                    )}
                </div>
            </aside>

            {/* 确认删除对话框 */}
            {friendToRemove && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">确认删除好友</h3>
                        <p className="text-base-content/70 mb-6">
                            确定要删除好友 "{friendToRemove.fullName}" 吗？此操作无法撤销。
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setFriendToRemove(null)}
                                className="btn btn-ghost"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmRemoveFriend}
                                className="btn btn-error"
                            >
                                确认删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
