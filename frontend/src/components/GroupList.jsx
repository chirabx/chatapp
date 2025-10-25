import { useEffect, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Plus, Settings, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const GroupList = () => {
    const { groups, selectedGroup, setSelectedGroup, fetchGroups, isLoading } = useGroupStore();
    const { authUser } = useAuthStore();
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupData, setNewGroupData] = useState({
        name: "",
        description: ""
    });

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupData.name.trim()) {
            toast.error("群组名称不能为空");
            return;
        }

        try {
            await useGroupStore.getState().createGroup(newGroupData);
            setNewGroupData({ name: "", description: "" });
            setShowCreateGroup(false);
        } catch (error) {
            // 错误已在store中处理
        }
    };

    const isGroupAdmin = (group) => {
        return group.createdBy._id === authUser._id ||
            group.members.some(member =>
                member.user._id === authUser._id && member.role === "admin"
            );
    };

    if (isLoading) {
        return (
            <div className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col">
                <div className="border-b border-base-300 w-full p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="size-6" />
                            <span className="font-medium hidden lg:block">群组列表</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="loading loading-spinner loading-md"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
                <div className="border-b border-base-300 w-full p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="size-6" />
                            <span className="font-medium hidden lg:block">群组列表</span>
                        </div>
                        <button
                            onClick={() => setShowCreateGroup(true)}
                            className="btn btn-sm btn-circle"
                            title="创建群组"
                        >
                            <Plus className="size-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto w-full py-3">
                    {groups.map((group) => (
                        <div
                            key={group._id}
                            className="group relative w-full p-3 flex items-center gap-3
                            hover:bg-base-300 transition-colors"
                        >
                            <button
                                onClick={() => setSelectedGroup(group)}
                                className={`
                                    flex-1 flex items-center gap-3
                                    ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                                `}
                            >
                                <div className="relative mx-auto lg:mx-0">
                                    <img
                                        src={group.avatar || "/avatar.png"}
                                        alt={group.name}
                                        className="size-12 object-cover rounded-full"
                                    />
                                </div>

                                <div className="hidden lg:block text-left min-w-0">
                                    <div className="font-medium truncate">{group.name}</div>
                                    <div className="text-sm text-zinc-400">
                                        {group.members.length} 成员
                                    </div>
                                </div>
                            </button>

                            {isGroupAdmin(group) && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity
                                    absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                    <Link
                                        to={`/groups/${group._id}/settings`}
                                        className="p-1.5 rounded-full hover:bg-base-300"
                                        title="群组设置"
                                    >
                                        <Settings className="size-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}

                    {groups.length === 0 && (
                        <div className="text-center text-zinc-500 py-4">
                            暂无群组
                        </div>
                    )}
                </div>
            </aside>

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
                                    disabled={!newGroupData.name.trim()}
                                >
                                    创建群组
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default GroupList;
