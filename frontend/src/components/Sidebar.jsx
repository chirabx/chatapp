import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";
import { useSidebarStore } from "../store/useSidebarStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus, UserMinus, Bot, MessageSquare, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LazyImage from "./LazyImage";
import { useLoadingStore } from "../store/useLoadingStore";

const Sidebar = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const { friends, fetchFriends, removeFriend } = useFriendStore();
    const { groups, selectedGroup, selectGroup, fetchGroups, createGroup, isCreatingGroup } = useGroupStore();
    const { authUser } = useAuthStore();
    const { setPageLoading } = useLoadingStore();
    const { activeTab, setActiveTab } = useSidebarStore();
    const navigate = useNavigate();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [friendToRemove, setFriendToRemove] = useState(null);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupData, setNewGroupData] = useState({
        name: "",
        description: ""
    });
    const [navigatingToGroupSettings, setNavigatingToGroupSettings] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setPageLoading("friends", true);
            setPageLoading("groups", true);

            try {
                await Promise.all([
                    fetchFriends(),
                    fetchGroups()
                ]);
            } finally {
                setPageLoading("friends", false);
                setPageLoading("groups", false);
            }
        };

        loadData();
    }, [fetchFriends, fetchGroups, setPageLoading]);

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

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupData.name.trim()) {
            toast.error("群组名称不能为空");
            return;
        }

        try {
            await createGroup(newGroupData);
            setNewGroupData({ name: "", description: "" });
            setShowCreateGroup(false);
        } catch (error) {
            // 错误已在store中处理
        }
    };

    const handleGroupSettingsClick = (groupId) => {
        setNavigatingToGroupSettings(groupId);
        // 添加小延迟，让用户看到加载状态，然后跳转
        setTimeout(() => {
            navigate(`/groups/${groupId}/settings`, { state: { fromGroup: true } });
            setNavigatingToGroupSettings(null);
        }, 800);
    };

    if (!friends) return <SidebarSkeleton />;

    return (
        <>
            <aside className="h-full w-16 sm:w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 relative">
                {/* 移动端浮动按钮 - 固定在侧边栏底部 */}
                {activeTab === "friends" && (
                    <div className="absolute bottom-4 right-4 z-10 lg:hidden">
                        <Link
                            to="/add-friend"
                            className="btn btn-sm btn-circle btn-primary shadow-lg"
                            title="添加好友"
                        >
                            <UserPlus className="size-4" />
                        </Link>
                    </div>
                )}

                {activeTab === "groups" && (
                    <div className="absolute bottom-4 right-2 z-10 lg:hidden">
                        <button
                            onClick={() => setShowCreateGroup(true)}
                            className="btn btn-sm btn-circle btn-primary shadow-lg"
                            title="创建群组"
                            disabled={isCreatingGroup}
                        >
                            {isCreatingGroup ? (
                                <div className="loading loading-spinner loading-sm"></div>
                            ) : (
                                <UserPlus className="size-4" />
                            )}
                        </button>
                    </div>
                )}

                <div className="border-b border-base-300 w-full p-3 sm:p-4 lg:p-5">
                    {/* 标签切换 */}
                    <div className="flex gap-1 mb-2 sm:mb-3">
                        {/* 手机端：只显示当前标签页的切换按钮 */}
                        <button
                            onClick={() => setActiveTab(activeTab === "friends" ? "groups" : "friends")}
                            className={`btn btn-sm flex-1 sm:hidden px-2 ${activeTab === "friends" ? "btn-primary" : "btn-neutral"} 
                                transition-all duration-200 hover:scale-105 active:scale-95
                                ${activeTab === "friends" ? "ring-2 ring-primary/20" : "ring-2 ring-neutral/20"}`}
                            title={activeTab === "friends" ? "切换到群组" : "切换到好友"}
                        >
                            <span className="text-xs font-bold truncate">
                                {activeTab === "friends" ? "好友" : "群组"}
                            </span>
                        </button>

                        {/* 桌面端：显示两个独立的按钮 */}
                        <button
                            onClick={() => setActiveTab("friends")}
                            className={`btn btn-sm flex-1 hidden sm:flex ${activeTab === "friends" ? "btn-primary" : "btn-ghost"} 
                                transition-all duration-200 hover:scale-105 active:scale-95
                                ${activeTab === "friends" ? "ring-2 ring-primary/20" : ""}`}
                            title="好友列表"
                        >
                            <Users className="size-4 sm:size-5" />
                            <span className="hidden sm:block text-xs sm:text-sm">好友</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("groups")}
                            className={`btn btn-sm flex-1 hidden sm:flex ${activeTab === "groups" ? "btn-primary" : "btn-ghost"} 
                                transition-all duration-200 hover:scale-105 active:scale-95
                                ${activeTab === "groups" ? "ring-2 ring-primary/20" : ""}`}
                            title="群组列表"
                        >
                            <MessageSquare className="size-4 sm:size-5" />
                            <span className="hidden sm:block text-xs sm:text-sm">群组</span>
                        </button>
                    </div>

                    {/* 好友列表头部 */}
                    {activeTab === "friends" && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <span className="font-medium text-xs sm:text-sm hidden lg:block">好友列表</span>
                                </div>
                                <Link
                                    to="/add-friend"
                                    className="btn btn-sm btn-circle hidden lg:flex"
                                    title="添加好友"
                                >
                                    <UserPlus className="size-3 sm:size-4 lg:size-5" />
                                </Link>
                            </div>
                            <div className="mt-2 sm:mt-3 hidden lg:flex items-center gap-2">
                                <label className="cursor-pointer flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showOnlineOnly}
                                        onChange={(e) => setShowOnlineOnly(e.target.checked)}
                                        className="checkbox checkbox-sm"
                                    />
                                    <span className="text-xs sm:text-sm">只显示在线好友</span>
                                </label>
                                <span className="text-xs text-zinc-500">
                                    ({onlineFriendsCount} 在线)
                                </span>
                            </div>
                        </>
                    )}

                    {/* 群组列表头部 */}
                    {activeTab === "groups" && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="font-medium text-xs sm:text-sm hidden lg:block">群组列表</span>
                            </div>
                            <button
                                onClick={() => setShowCreateGroup(true)}
                                className="btn btn-sm btn-circle hidden lg:flex"
                                title="创建群组"
                                disabled={isCreatingGroup}
                            >
                                {isCreatingGroup ? (
                                    <div className="loading loading-spinner loading-sm"></div>
                                ) : (
                                    <UserPlus className="size-3 sm:size-4 lg:size-5" />
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-y-auto w-full py-3">
                    {/* 机器人聊天选项 - 只在好友标签页显示 */}
                    {activeTab === "friends" && (
                        <div
                            className="group relative w-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3
                            hover:bg-base-300 transition-colors"
                        >
                            <button
                                onClick={() => {
                                    setSelectedUser({ _id: 'bot', fullName: 'ChiraBot', profilePic: '/avatar.png' });
                                    selectGroup(null);
                                    setActiveTab("friends"); // 确保切换到好友标签页
                                }}
                                className={`
                                    flex-1 flex items-center gap-2 sm:gap-3
                                    ${selectedUser?._id === 'bot' ? "bg-base-300 ring-1 ring-base-300" : ""}
                                `}
                            >
                                <div className="relative mx-auto lg:mx-0">
                                    <LazyImage
                                        src="/avatar.png"
                                        alt="ChiraBot"
                                        className="size-8 sm:size-10 lg:size-12 object-cover rounded-full"
                                    />
                                </div>

                                <div className="hidden lg:block text-left min-w-0">
                                    <div className="font-medium text-sm truncate">ChiraBot</div>
                                    <div className="text-xs text-zinc-400">AI 助手</div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* 好友列表 */}
                    {activeTab === "friends" && (
                        <>
                            {filteredFriends.map((friend) => (
                                <div
                                    key={friend._id}
                                    className="group relative w-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3
                                    hover:bg-base-300 transition-colors"
                                >
                                    <button
                                        onClick={() => {
                                            setSelectedUser(friend);
                                            selectGroup(null);
                                            setActiveTab("friends"); // 确保切换到好友标签页
                                        }}
                                        className={`
                                            flex-1 flex items-center gap-2 sm:gap-3
                                            ${selectedUser?._id === friend._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                                        `}
                                    >
                                        <div className="relative mx-auto lg:mx-0">
                                            <LazyImage
                                                src={friend.profilePic || "/avatar.png"}
                                                alt={friend.fullName}
                                                className="size-8 sm:size-10 lg:size-12 object-cover rounded-full"
                                            />
                                            {onlineUsers.includes(friend._id) && (
                                                <span
                                                    className="absolute bottom-0 right-0 size-2 sm:size-3 bg-green-500 
                                            rounded-full ring-1 sm:ring-2 ring-zinc-900"
                                                />
                                            )}
                                        </div>

                                        <div className="hidden lg:block text-left min-w-0">
                                            <div className="font-medium text-sm truncate">{friend.fullName}</div>
                                            <div className="text-xs text-zinc-400">
                                                {onlineUsers.includes(friend._id) ? "在线" : "离线"}
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleRemoveFriend(friend)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity
                                        absolute right-1 sm:right-2 lg:right-3 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 rounded-full
                                        hover:bg-base-300 z-10"
                                        title="删除好友"
                                    >
                                        <UserMinus className="size-3 sm:size-4 text-red-500" />
                                    </button>
                                </div>
                            ))}

                            {filteredFriends.length === 0 && (
                                <div className="text-center text-zinc-500 py-4">
                                    {showOnlineOnly ? "没有在线好友" : "暂无好友"}
                                </div>
                            )}
                        </>
                    )}

                    {/* 群组列表 */}
                    {activeTab === "groups" && (
                        <>
                            {groups.map((group) => (
                                <div
                                    key={group._id}
                                    className="group relative w-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3
                                    hover:bg-base-300 transition-colors"
                                >
                                    <button
                                        onClick={() => {
                                            console.log("选择群组:", group);
                                            selectGroup(group);
                                            setSelectedUser(null);
                                            setActiveTab("groups"); // 确保切换到群组标签页
                                        }}
                                        className={`
                                            flex-1 flex items-center gap-2 sm:gap-3
                                            ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                                        `}
                                    >
                                        <div className="relative mx-auto lg:mx-0">
                                            <LazyImage
                                                src={group.avatar || "/avatar.png"}
                                                alt={group.name}
                                                className="size-8 sm:size-10 lg:size-12 object-cover rounded-full"
                                            />
                                        </div>

                                        <div className="hidden lg:block text-left min-w-0">
                                            <div className="font-medium text-sm truncate">
                                                {group.name} ({group._id.slice(-6)})
                                            </div>
                                            <div className="text-xs text-zinc-400">
                                                {group.members.length} 成员
                                            </div>
                                        </div>
                                    </button>

                                    {/* 群组设置按钮 */}
                                    {(group.createdBy._id === authUser._id ||
                                        group.members.some(member =>
                                            member.user._id === authUser._id && member.role === "admin"
                                        )) && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleGroupSettingsClick(group._id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity
                                            absolute right-1 sm:right-2 lg:right-3 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 rounded-full
                                            hover:bg-base-300 z-10"
                                                title="群组设置"
                                                disabled={navigatingToGroupSettings === group._id}
                                            >
                                                {navigatingToGroupSettings === group._id ? (
                                                    <div className="loading loading-spinner loading-xs"></div>
                                                ) : (
                                                    <Settings className="size-3 sm:size-4" />
                                                )}
                                            </button>
                                        )}
                                </div>
                            ))}

                            {groups.length === 0 && (
                                <div className="text-center text-zinc-500 py-4">
                                    暂无群组
                                </div>
                            )}
                        </>
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

            {/* 创建群组对话框 */}
            {showCreateGroup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">创建群组</h3>
                        <form onSubmit={handleCreateGroup}>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text">群组名称</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newGroupData.name}
                                        onChange={(e) => setNewGroupData({
                                            ...newGroupData,
                                            name: e.target.value
                                        })}
                                        className="input input-bordered w-full"
                                        placeholder="请输入群组名称"
                                        maxLength={50}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">
                                        <span className="label-text">群组描述</span>
                                    </label>
                                    <textarea
                                        value={newGroupData.description}
                                        onChange={(e) => setNewGroupData({
                                            ...newGroupData,
                                            description: e.target.value
                                        })}
                                        className="textarea textarea-bordered w-full"
                                        placeholder="请输入群组描述（可选）"
                                        maxLength={200}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateGroup(false)}
                                    className="btn btn-ghost"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!newGroupData.name.trim() || isCreatingGroup}
                                >
                                    {isCreatingGroup ? (
                                        <>
                                            <div className="loading loading-spinner loading-sm mr-2"></div>
                                            创建中...
                                        </>
                                    ) : (
                                        "创建群组"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
