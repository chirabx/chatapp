import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Save, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const { authUser, isUpdatingProfile, isChangingPassword, updateProfile, changePassword } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);
    const [fullName, setFullName] = useState("");
    const [tagline, setTagline] = useState("");
    const [isDirty, setIsDirty] = useState(false);

    // 密码相关状态
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        setFullName(authUser?.fullName || "");
        setTagline(authUser?.tagline || "");
        setIsDirty(false);
    }, [authUser]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
            await updateProfile({ profilePic: base64Image });
        };
    };

    return (
        <div className="min-h-screen pt-20 pb-8">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-100/50 backdrop-blur-md rounded-xl p-6 space-y-8 border border-base-300/50 shadow-lg">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold">个人资料</h1>
                        <p className="mt-2">您的个人信息</p>
                    </div>

                    {/* 头像上传部分 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img
                                src={selectedImg || authUser.profilePic || "/avatar.png"}
                                alt="头像"
                                className="size-32 rounded-full object-cover border-4"
                            />
                            <label
                                htmlFor="avatar-upload"
                                className={`
                                    absolute bottom-0 right-0 
                                    bg-base-content hover:scale-105
                                    p-2 rounded-full cursor-pointer 
                                    transition-all duration-200
                                    ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                                `}
                            >
                                <Camera className="w-5 h-5 text-base-200" />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUpdatingProfile}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-zinc-400">
                            {isUpdatingProfile ? "上传中..." : "点击相机图标更新您的头像"}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                姓名
                            </div>
                            <input
                                type="text"
                                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                                value={fullName}
                                onChange={(e) => { setFullName(e.target.value); setIsDirty(true); }}
                                placeholder="请输入姓名"
                                maxLength={50}
                                disabled={isUpdatingProfile}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                邮箱地址
                            </div>
                            <p
                                className="px-4 py-2.5 bg-base-200 rounded-lg border cursor-not-allowed opacity-75"
                                title="邮箱地址不可修改"
                            >
                                {authUser?.email}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                个人标签
                            </div>
                            <textarea
                                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full min-h-20 resize-y"
                                value={tagline}
                                onChange={(e) => { setTagline(e.target.value); setIsDirty(true); }}
                                placeholder="写点关于你的标签或签名（可为空，最多140字）"
                                maxLength={140}
                                disabled={isUpdatingProfile}
                            />
                            <div className="text-right text-xs text-base-content/50">{tagline.length}/140</div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="btn btn-primary"
                                disabled={isUpdatingProfile || (!isDirty && selectedImg === null)}
                                onClick={async () => {
                                    const payload = {};
                                    if (fullName !== authUser?.fullName) payload.fullName = fullName.trim();
                                    if ((tagline || "") !== (authUser?.tagline || "")) payload.tagline = tagline.trim();
                                    if (Object.keys(payload).length === 0) return;
                                    await updateProfile(payload);
                                    setIsDirty(false);
                                }}
                            >
                                {isUpdatingProfile ? <span className="loading loading-spinner loading-sm"></span> : <Save className="w-4 h-4 mr-2" />}
                                保存
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 bg-base-100/50 backdrop-blur-sm rounded-xl p-6 border border-base-300/50">
                        <h2 className="text-lg font-medium mb-4">账号信息</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                                <span>注册时间</span>
                                <span>{authUser.createdAt?.split("T")[0]}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span>账号状态</span>
                                <span className="text-green-500">正常</span>
                            </div>
                        </div>
                    </div>

                    {/* 修改密码 */}
                    <div className="mt-6 bg-base-100/50 backdrop-blur-sm rounded-xl p-6 border border-base-300/50">
                        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            修改密码
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm text-base-content/70">当前密码</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        className="px-4 py-2.5 bg-base-200 rounded-lg border w-full pr-10"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="请输入当前密码"
                                        disabled={isChangingPassword}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm text-base-content/70">新密码</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        className="px-4 py-2.5 bg-base-200 rounded-lg border w-full pr-10"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="请输入新密码（至少6位）"
                                        disabled={isChangingPassword}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm text-base-content/70">确认新密码</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="px-4 py-2.5 bg-base-200 rounded-lg border w-full pr-10"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="请再次输入新密码"
                                        disabled={isChangingPassword}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    className="btn btn-primary"
                                    disabled={
                                        isChangingPassword ||
                                        !currentPassword ||
                                        !newPassword ||
                                        !confirmPassword ||
                                        newPassword.length < 6 ||
                                        newPassword !== confirmPassword
                                    }
                                    onClick={async () => {
                                        if (newPassword !== confirmPassword) {
                                            toast.error("两次输入的密码不一致");
                                            return;
                                        }
                                        if (newPassword.length < 6) {
                                            toast.error("新密码长度至少为6位");
                                            return;
                                        }
                                        const success = await changePassword({
                                            currentPassword,
                                            newPassword,
                                        });
                                        if (success) {
                                            setCurrentPassword("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }
                                    }}
                                >
                                    {isChangingPassword ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            修改密码
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
