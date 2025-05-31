import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
    const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);

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
        <div className="fixed inset-0 bg-base-100 overflow-y-auto">
            <div className="h-screen pt-20">
                <div className="max-w-2xl mx-auto p-4 py-8">
                    <div className="bg-base-300 rounded-xl p-6 space-y-8">
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
                                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
                            </div>

                            <div className="space-y-1.5">
                                <div className="text-sm text-zinc-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    邮箱地址
                                </div>
                                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
                            </div>
                        </div>

                        <div className="mt-6 bg-base-300 rounded-xl p-6">
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
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
