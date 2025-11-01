import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useGroupStore } from "../store/useGroupStore";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { ArrowLeft, Users, Settings, UserPlus, Trash2, UserMinus } from "lucide-react";
import toast from "react-hot-toast";
import LazyImage from "../components/LazyImage";
import GroupSettingsSkeleton from "../components/skeletons/GroupSettingsSkeleton";

const GroupSettings = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { authUser } = useAuthStore();
    const { switchToGroups } = useSidebarStore();
    const {
        groups,
        selectedGroup,
        selectGroup,
        getGroupDetails,
        updateGroup,
        addMember,
        addMemberById,
        removeMember,
        deleteGroup,
        getGroupMembers
    } = useGroupStore();
    const { friends } = useFriendStore();

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [addMemberMode, setAddMemberMode] = useState("email"); // "email" or "friend"
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState("");
    const [groupData, setGroupData] = useState({
        name: "",
        description: ""
    });

    // 处理返回导航
    const handleBack = () => {
        // 切换到群组标签页
        switchToGroups();

        // 如果是从群聊页面跳转过来的，选择该群组并返回首页
        if (location.state?.fromGroup && group) {
            selectGroup(group);
            navigate("/");
        } else {
            // 否则直接返回首页
            navigate("/");
        }
    };

    useEffect(() => {
        const loadGroupData = async () => {
            try {
                setIsLoading(true);
                setIsInitialLoad(true);

                // 添加小延迟，让骨架屏显示一会儿
                await new Promise(resolve => setTimeout(resolve, 500));

                const groupDetails = await getGroupDetails(groupId);
                setGroup(groupDetails);
                setGroupData({
                    name: groupDetails.name,
                    description: groupDetails.description || ""
                });

                const membersData = await getGroupMembers(groupId);
                setMembers(membersData);
            } catch (error) {
                toast.error("获取群组信息失败");
                navigate("/");
            } finally {
                setIsLoading(false);
                setIsInitialLoad(false);
            }
        };

        if (groupId) {
            loadGroupData();
        }
    }, [groupId, getGroupDetails, getGroupMembers, navigate]);

    const isGroupAdmin = group && (
        group.createdBy._id === authUser._id ||
        group.members.some(member =>
            member.user._id === authUser._id && member.role === "admin"
        )
    );

    const isGroupOwner = group && group.createdBy._id === authUser._id;

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        if (!groupData.name.trim()) {
            toast.error("群组名称不能为空");
            return;
        }

        try {
            await updateGroup(groupId, groupData);
            toast.success("群组信息已更新");
        } catch (error) {
            // 错误已在store中处理
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();

        if (addMemberMode === "email") {
            if (!newMemberEmail.trim()) {
                toast.error("请输入邮箱地址");
                return;
            }
            try {
                await addMember(groupId, newMemberEmail);
                setNewMemberEmail("");
            } catch (error) {
                // 错误已在store中处理
                return;
            }
        } else {
            if (!selectedFriendId) {
                toast.error("请选择要添加的好友");
                return;
            }
            try {
                await addMemberById(groupId, selectedFriendId);
                setSelectedFriendId("");
            } catch (error) {
                // 错误已在store中处理
                return;
            }
        }

        setShowAddMember(false);

        // 重新加载成员列表
        const membersData = await getGroupMembers(groupId);
        setMembers(membersData);
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("确定要移除此成员吗？")) {
            return;
        }

        try {
            await removeMember(groupId, memberId);

            // 重新加载成员列表
            const membersData = await getGroupMembers(groupId);
            setMembers(membersData);
        } catch (error) {
            // 错误已在store中处理
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("确定要解散群组吗？此操作不可撤销！")) {
            return;
        }

        try {
            await deleteGroup(groupId);
            navigate("/");
        } catch (error) {
            // 错误已在store中处理
        }
    };

    if (isInitialLoad) {
        return (
            <div className="animate-fadeIn">
                <GroupSettingsSkeleton />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-base-content/70 mb-2">
                        群组不存在
                    </h3>
                    <button
                        onClick={() => navigate("/")}
                        className="btn btn-primary"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-8 animate-fadeIn">
            <div className="max-w-2xl mx-auto p-4 py-8">
                {/* 头部 */}
                <div className="bg-base-100/50 backdrop-blur-md rounded-xl p-4 mb-6 border border-base-300/50 shadow-lg">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="btn btn-ghost btn-sm"
                            title="返回"
                        >
                            <ArrowLeft className="size-4" />
                        </button>
                        <div className="flex items-center gap-3">
                            <LazyImage
                                src={group.avatar || "/avatar.png"}
                                alt={group.name}
                                className="size-10 object-cover rounded-full"
                            />
                            <div>
                                <h2 className="text-lg font-semibold">{group.name}</h2>
                                <p className="text-sm text-base-content/70">
                                    {group.members.length} 成员
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* 群组信息设置 */}
                    <div className="bg-base-100/50 backdrop-blur-md rounded-xl p-6 border border-base-300/50 shadow-lg">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Settings className="size-5" />
                                群组信息
                            </h3>
                        </div>
                        <form onSubmit={handleUpdateGroup}>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text">群组名称</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={groupData.name}
                                        onChange={(e) => setGroupData({
                                            ...groupData,
                                            name: e.target.value
                                        })}
                                        className="input input-bordered w-full"
                                        maxLength={50}
                                        disabled={!isGroupAdmin}
                                    />
                                </div>
                                <div>
                                    <label className="label">
                                        <span className="label-text">群组描述</span>
                                    </label>
                                    <textarea
                                        value={groupData.description}
                                        onChange={(e) => setGroupData({
                                            ...groupData,
                                            description: e.target.value
                                        })}
                                        className="textarea textarea-bordered w-full"
                                        maxLength={200}
                                        rows={3}
                                        disabled={!isGroupAdmin}
                                    />
                                </div>
                            </div>
                            {isGroupAdmin && (
                                <div className="flex justify-end mt-4">
                                    <button type="submit" className="btn btn-primary">
                                        保存更改
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* 成员管理 */}
                    <div className="bg-base-100/50 backdrop-blur-md rounded-xl p-6 border border-base-300/50 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="size-5" />
                                群成员 ({members.length})
                            </h3>
                            {isGroupAdmin && (
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="btn btn-sm btn-primary"
                                >
                                    <UserPlus className="size-4" />
                                    添加成员
                                </button>
                            )}
                        </div>

                        {/* 成员列表 */}
                        <div className="space-y-2">
                            {members.map((member) => (
                                <div
                                    key={member.user._id}
                                    className="flex items-center justify-between p-3 bg-base-200/50 backdrop-blur-sm rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <LazyImage
                                            src={member.user.profilePic || "/avatar.png"}
                                            alt={member.user.fullName}
                                            className="size-10 object-cover rounded-full"
                                        />
                                        <div>
                                            <div className="font-medium">
                                                {member.user.fullName}
                                            </div>
                                            <div className="text-sm text-base-content/70">
                                                {member.role === "admin" ? "管理员" : "成员"}
                                                {group.createdBy._id === member.user._id && " (群主)"}
                                            </div>
                                        </div>
                                    </div>
                                    {isGroupAdmin &&
                                        member.user._id !== authUser._id &&
                                        group.createdBy._id !== member.user._id && (
                                            <button
                                                onClick={() => handleRemoveMember(member.user._id)}
                                                className="btn btn-sm btn-error btn-ghost"
                                                title="移除成员"
                                            >
                                                <UserMinus className="size-4" />
                                            </button>
                                        )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 危险操作 */}
                    {isGroupOwner && (
                        <div className="bg-error/10 backdrop-blur-sm rounded-xl p-6 border border-error/20 shadow-lg">
                            <h3 className="text-lg font-semibold text-error flex items-center gap-2 mb-4">
                                <Trash2 className="size-5" />
                                危险操作
                            </h3>
                            <p className="text-sm text-base-content/70 mb-4">
                                解散群组将删除所有消息和成员信息，此操作不可撤销。
                            </p>
                            <button
                                onClick={handleDeleteGroup}
                                className="btn btn-error"
                            >
                                <Trash2 className="size-4" />
                                解散群组
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 添加成员对话框 */}
            {showAddMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">添加成员</h3>

                        {/* 添加方式选择 */}
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setAddMemberMode("email")}
                                className={`btn btn-sm ${addMemberMode === "email" ? "btn-primary" : "btn-ghost"}`}
                            >
                                邮箱添加
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddMemberMode("friend")}
                                className={`btn btn-sm ${addMemberMode === "friend" ? "btn-primary" : "btn-ghost"}`}
                            >
                                从好友添加
                            </button>
                        </div>

                        <form onSubmit={handleAddMember}>
                            <div className="space-y-4">
                                {addMemberMode === "email" ? (
                                    <div>
                                        <label className="label">
                                            <span className="label-text">成员邮箱</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={newMemberEmail}
                                            onChange={(e) => setNewMemberEmail(e.target.value)}
                                            className="input input-bordered w-full"
                                            placeholder="请输入要添加的成员邮箱"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="label">
                                            <span className="label-text">选择好友</span>
                                        </label>
                                        <select
                                            value={selectedFriendId}
                                            onChange={(e) => setSelectedFriendId(e.target.value)}
                                            className="select select-bordered w-full"
                                            required
                                        >
                                            <option value="">请选择要添加的好友</option>
                                            {friends
                                                .filter(friend =>
                                                    !members.some(member => member.user._id === friend._id)
                                                )
                                                .map(friend => (
                                                    <option key={friend._id} value={friend._id}>
                                                        {friend.fullName} ({friend.email})
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        {friends.filter(friend =>
                                            !members.some(member => member.user._id === friend._id)
                                        ).length === 0 && (
                                                <div className="text-sm text-base-content/70 mt-2">
                                                    没有可添加的好友
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddMember(false);
                                        setNewMemberEmail("");
                                        setSelectedFriendId("");
                                        setAddMemberMode("email");
                                    }}
                                    className="btn btn-ghost"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        addMemberMode === "email"
                                            ? !newMemberEmail.trim()
                                            : !selectedFriendId
                                    }
                                >
                                    添加成员
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupSettings;
